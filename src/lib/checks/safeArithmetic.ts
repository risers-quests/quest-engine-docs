// A minimal, safe arithmetic expression evaluator - no eval()/Function(), so a
// model-generated expression string can never execute arbitrary code.
// Supports: + - * / ( ), unary +/-, and decimal numbers.

export class ExpressionSyntaxError extends Error {}

export function evaluateArithmetic(expression: string): number {
  const tokens = tokenize(expression);
  let pos = 0;

  function peek(): string | undefined {
    return tokens[pos];
  }

  function consume(expected?: string): string {
    const token = tokens[pos];
    if (token === undefined) {
      throw new ExpressionSyntaxError(`Unexpected end of expression in "${expression}"`);
    }
    if (expected !== undefined && token !== expected) {
      throw new ExpressionSyntaxError(
        `Expected "${expected}" but got "${token}" in "${expression}"`
      );
    }
    pos += 1;
    return token;
  }

  function parseExpression(): number {
    let value = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const op = consume();
      const rhs = parseTerm();
      value = op === "+" ? value + rhs : value - rhs;
    }
    return value;
  }

  function parseTerm(): number {
    let value = parseUnary();
    while (peek() === "*" || peek() === "/") {
      const op = consume();
      const rhs = parseUnary();
      if (op === "/" && rhs === 0) {
        throw new ExpressionSyntaxError(`Division by zero in "${expression}"`);
      }
      value = op === "*" ? value * rhs : value / rhs;
    }
    return value;
  }

  function parseUnary(): number {
    if (peek() === "-") {
      consume("-");
      return -parseUnary();
    }
    if (peek() === "+") {
      consume("+");
      return parseUnary();
    }
    return parseAtom();
  }

  function parseAtom(): number {
    const token = consume();
    if (token === "(") {
      const value = parseExpression();
      consume(")");
      return value;
    }
    const value = Number(token);
    if (Number.isNaN(value)) {
      throw new ExpressionSyntaxError(`Invalid number "${token}" in "${expression}"`);
    }
    return value;
  }

  const result = parseExpression();
  if (pos !== tokens.length) {
    throw new ExpressionSyntaxError(`Unexpected trailing input in "${expression}"`);
  }
  return result;
}

function tokenize(expression: string): string[] {
  const tokens: string[] = [];
  const pattern = /\s*([()+\-*/]|\d+\.?\d*|\.\d+)\s*/y;
  let index = 0;
  while (index < expression.length) {
    pattern.lastIndex = index;
    const match = pattern.exec(expression);
    if (!match || match.index !== index) {
      throw new ExpressionSyntaxError(
        `Unrecognized character at position ${index} in "${expression}"`
      );
    }
    tokens.push(match[1]);
    index = pattern.lastIndex;
  }
  return tokens;
}
