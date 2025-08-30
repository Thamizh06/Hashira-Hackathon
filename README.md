Hashira Placements — Polynomial Reconstruction (Node.js)

Compute the constant term c = f(0) of a polynomial from JSON-encoded points (x, y).
Each y is given in a numeral base (2..62). Using any k points (with k = degree + 1), the program reconstructs f(0) exactly (no floating-point errors) via Lagrange interpolation using BigInt fractions.

Input: JSON on STDIN

Output: prints only the integer c (no extra text)

📦 Requirements

Node.js v14+ (BigInt support)

You’re on Windows PowerShell (commands below are PowerShell-friendly)

solve.js — Reads JSON from STDIN → decodes bases → computes f(0) exactly → prints integer

README.md — This file

▶️ How to Run (PowerShell)

Run these commands from the folder where solve.js exists (e.g., PS C:\Users\You\Desktop\Hash>).

Option A — Pipe a here-string directly to Node (quickest)

@'
{
    "keys": {
        "n": 4,
        "k": 3
    },
    "1": { "base": "10", "value": "4" },
    "2": { "base": "2",  "value": "111" },
    "3": { "base": "10", "value": "12" },
    "6": { "base": "4",  "value": "213" }
}
'@ | node .\solve.js

Expected output
3

Option B — Save input to a file, then pipe it
@'
{
    "keys": {
        "n": 4,
        "k": 3
    },
    "1": { "base": "10", "value": "4" },
    "2": { "base": "2",  "value": "111" },
    "3": { "base": "10", "value": "12" },
    "6": { "base": "4",  "value": "213" }
}
'@ | Set-Content .\input.json

Get-Content .\input.json | node .\solve.js
Expected output
3

🧩 Input Format
{
  "keys": { "n": <number_of_points>, "k": <required_points> },
  "<x1>": { "base": "<b1>", "value": "<y1_in_base_b1>" },
  "<x2>": { "base": "<b2>", "value": "<y2_in_base_b2>" },
  ...
}
Keys other than "keys" are the x-coordinates as strings (e.g., "6").

Each object has:

"base": numeral base of the encoded y (supports 2..62; digits 0–9, A–Z, a–z)

"value": the y value in that base (converted to BigInt)


