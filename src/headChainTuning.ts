/**
 * headChainTuning.ts
 *
 * Single source of truth for how one tracked head orientation is distributed
 * across the three spine-chain bones: Spine2 → Neck → Head.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * This mapping used to be duplicated verbatim in two places:
 *   - components/mocap/Avatar.tsx        (live preview, runs per frame)
 *   - components/mocap/useMotionRecorder.ts (GLB export, runs offline)
 *
 * Two copies of the same magic numbers meant the live preview and the exported
 * animation could silently drift apart. Everything is centralised here so a
 * change is impossible to apply to only one of the two paths.
 *
 * THE ROTATION CORRECTION
 * -----------------------
 * Measured empirically in Blender against the exported rig at a NEUTRAL head
 * pose. At neutral the three bones should rest at (near) identity, but they sat
 * at these local X angles instead:
 *
 *   bone     measured X    target X    correction
 *   Spine2     -5.822°       0.178°       +6°
 *   Neck       -7.067°      -1.067°       +6°
 *   Head      +14.609°      +1.611°      -13°
 *
 * Y and Z were already correct (they differ by <0.1° between measured and
 * target), so the correction is applied purely about each bone's local X axis.
 *
 * IMPORTANT — why these are per-bone and not one upstream constant:
 * A single constant error in the incoming head Euler would have to appear in
 * the fixed ratio 1:2:10 across Spine2:Neck:Head, because of the divisors
 * below. The measured corrections are +6:+6:-13, which no single upstream
 * constant can produce. The reason is that Blender reports each bone's rotation
 * relative to its own rest orientation (and after the glTF axis conversion),
 * so one shared world-space error resolves to a different local angle and sign
 * on every bone. That makes a per-bone local correction the only correct shape
 * for this fix.
 *
 * The corrections are PRE-multiplied (correction * boneRotation). This order was
 * verified numerically against the measured data: pre-multiplying reproduces the
 * target pose with the X delta landing on exactly 6.000 / 6.000 / -13.000 and
 * near-zero Y/Z error, whereas post-multiplying leaks up to 0.31° into the Z
 * axis. In other words the correction belongs in the bone's PARENT space, not
 * its own local space.
 */

import { Euler, Quaternion } from "three";

const DEG_TO_RAD = Math.PI / 180;

/**
 * Fraction of the head rotation that each follower bone receives.
 * Head takes the full rotation; Neck takes 1/5; Spine2 takes 1/10.
 */
export const NECK_DIVISOR = 5;
export const SPINE2_DIVISOR = 10;

/**
 * Constant forward pitch (radians) baked into the Neck's X axis.
 *
 * NOTE: this is a long-standing rig hack, kept here for behavioural
 * compatibility. It is worth being aware of its side effect: because it is a
 * constant, the Neck does NOT return to its rest pose when tracking is
 * neutral — it holds 0.3 rad (~17.19°) of forward pitch forever. The X
 * corrections below were measured with this offset already active, so the two
 * must always be changed together. Removing this line without re-measuring in
 * Blender will reintroduce the pose error.
 */
export const NECK_X_REST_OFFSET = 0.3;

/** Per-bone local-X correction, in degrees. See the table above. */
export const HEAD_CHAIN_X_CORRECTION_DEG = {
  head: -13,
  neck: 6,
  spine2: 6,
} as const;

// Pre-built correction quaternions (pure local-X rotations), created once.
const _correctionHead = new Quaternion().setFromEuler(
  new Euler(HEAD_CHAIN_X_CORRECTION_DEG.head * DEG_TO_RAD, 0, 0, "XYZ")
);
const _correctionNeck = new Quaternion().setFromEuler(
  new Euler(HEAD_CHAIN_X_CORRECTION_DEG.neck * DEG_TO_RAD, 0, 0, "XYZ")
);
const _correctionSpine2 = new Quaternion().setFromEuler(
  new Euler(HEAD_CHAIN_X_CORRECTION_DEG.spine2 * DEG_TO_RAD, 0, 0, "XYZ")
);

// Scratch objects reused across calls to keep the render loop allocation-free.
const _scratchEuler = new Euler(0, 0, 0, "XYZ");

/** The three resolved bone rotations for a single frame. */
export interface HeadChainQuats {
  head: Quaternion;
  neck: Quaternion;
  spine2: Quaternion;
}

/** Allocate a reusable result object (call once, not per frame). */
export function createHeadChainQuats(): HeadChainQuats {
  return {
    head: new Quaternion(),
    neck: new Quaternion(),
    spine2: new Quaternion(),
  };
}

/**
 * Resolve the Spine2 / Neck / Head local rotations for one frame.
 *
 * @param headEuler  The smoothed head rotation as an XYZ Euler. Used to derive
 *                   the fractional Neck and Spine2 rotations.
 * @param out        Result object from createHeadChainQuats(), written in place.
 * @param headQuat   Optional exact head quaternion. The live path has a full
 *                   smoothed quaternion available and passing it avoids a
 *                   lossy Euler round-trip; when omitted the head rotation is
 *                   rebuilt from headEuler instead.
 */
export function resolveHeadChain(
  headEuler: Euler,
  out: HeadChainQuats,
  headQuat?: Quaternion
): HeadChainQuats {
  // ── Head: full rotation ───────────────────────────────────────────────────
  if (headQuat) {
    out.head.copy(headQuat);
  } else {
    _scratchEuler.set(headEuler.x, headEuler.y, headEuler.z, "XYZ");
    out.head.setFromEuler(_scratchEuler);
  }
  out.head.premultiply(_correctionHead);

  // ── Neck: 1/5 of the rotation, plus the constant rest offset ──────────────
  _scratchEuler.set(
    headEuler.x / NECK_DIVISOR + NECK_X_REST_OFFSET,
    headEuler.y / NECK_DIVISOR,
    headEuler.z / NECK_DIVISOR,
    "XYZ"
  );
  out.neck.setFromEuler(_scratchEuler).premultiply(_correctionNeck);

  // ── Spine2: 1/10 of the rotation ──────────────────────────────────────────
  _scratchEuler.set(
    headEuler.x / SPINE2_DIVISOR,
    headEuler.y / SPINE2_DIVISOR,
    headEuler.z / SPINE2_DIVISOR,
    "XYZ"
  );
  out.spine2.setFromEuler(_scratchEuler).premultiply(_correctionSpine2);

  return out;
}
