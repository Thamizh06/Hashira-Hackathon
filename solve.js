#!/usr/bin/env node
"use strict";

/**
 * Hashira Placements Assignment — Polynomial Reconstruction (JS/Node)
 * Reads JSON from STDIN, decodes points, and prints the constant term c = f(0).
 * Output: a single integer on stdout (no extra text).
 *
 * Works with arbitrarily large integers using BigInt and exact rational arithmetic.
 */

const fs = require('fs');

// ---------- Utilities: BigInt Rational ----------
function bgcd(a, b) {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) {
    const t = a % b;
    a = b; b = t;
  }
  return a;
}

class Frac {
  constructor(num, den = 1n) {
    if (den === 0n) throw new Error("Zero denominator");
    if (den < 0n) { num = -num; den = -den; }
    const g = bgcd(num, den);
    this.n = num / g;
    this.d = den / g;
  }
  static fromBigInt(n) { return new Frac(BigInt(n), 1n); }
  add(other) {
    const n = this.n * other.d + other.n * this.d;
    const d = this.d * other.d;
    return new Frac(n, d);
  }
  mul(other) { return new Frac(this.n * other.n, this.d * other.d); }
  div(other) { return new Frac(this.n * other.d, this.d * other.n); }
  neg() { return new Frac(-this.n, this.d); }
  toBigIntExact() {
    if (this.d !== 1n) throw new Error("Result is not an integer");
    return this.n;
  }
}

// ---------- Base decoding (up to base 62) ----------
const DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const DIGMAP = new Map([...DIGITS].map((ch, idx) => [ch, BigInt(idx)]));

function decodeBase(str, base) {
  if (typeof str !== 'string') str = String(str);
  const b = BigInt(base);
  if (b < 2n || b > 62n) throw new Error("Unsupported base: " + base);
  let neg = false;
  if (str[0] === '-') { neg = true; str = str.slice(1); }
  let val = 0n;
  for (const ch of str) {
    const d = DIGMAP.get(ch) ?? DIGMAP.get(ch.toUpperCase());
    if (d === undefined || d >= b)
      throw new Error(`Invalid digit '${ch}' for base ${base}`);
    val = val * b + d;
  }
  return neg ? -val : val;
}

// ---------- Lagrange interpolation at x = 0 (constant term) ----------
function constantTermLagrange(points) {
  // points: array of [x(BigInt), y(BigInt)], length = k (degree k-1)
  const k = points.length;
  let sum = new Frac(0n, 1n);
  for (let i = 0; i < k; i++) {
    const xi = points[i][0];
    const yi = points[i][1];
    let num = 1n; // product of (-xj) for j!=i
    let den = 1n; // product of (xi - xj) for j!=i
    for (let j = 0; j < k; j++) {
      if (j === i) continue;
      const xj = points[j][0];
      num *= (-xj);
      den *= (xi - xj);
    }
    const term = new Frac(yi * num, den); // yi * Π(-xj)/(xi-xj)
    sum = sum.add(term);
  }
  return sum.toBigIntExact();
}

// ---------- Main ----------
(function main() {
  const input = fs.readFileSync(0, 'utf8').trim();
  if (!input) { console.error("No input"); process.exit(1); }
  let data;
  try { data = JSON.parse(input); } catch (e) {
    console.error("Invalid JSON"); process.exit(1);
  }
  const { n, k } = data.keys || {};
  if (typeof n !== 'number' || typeof k !== 'number') {
    console.error("Missing or invalid 'keys': { n, k }");
    process.exit(1);
  }

  // Collect (x,y) pairs
  const pts = [];
  for (const [xkey, obj] of Object.entries(data)) {
    if (xkey === 'keys') continue;
    const x = BigInt(xkey);
    const base = parseInt(obj.base, 10);
    const y = decodeBase(String(obj.value), base);
    pts.push([x, y]);
  }

  if (pts.length !== n) {
    console.error(`Expected n=${n} points, found ${pts.length}`);
    process.exit(1);
  }
  if (k < 1 || k > pts.length) {
    console.error(`Invalid k=${k} for n=${pts.length}`);
    process.exit(1);
  }

  // Deterministic subset: pick first k points sorted by x
  pts.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const subset = pts.slice(0, k);

  // Compute c = f(0)
  const c = constantTermLagrange(subset);

  // Print only the integer
  process.stdout.write(c.toString());
})();
