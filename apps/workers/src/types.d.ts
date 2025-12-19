declare global {
  var crypto: {
    randomUUID(): string;
    subtle: {
      digest(algorithm: string, data: Uint8Array): Promise<ArrayBuffer>;
    };
  };
}

declare global {
  var TextEncoder: {
    new (encoding?: string): TextEncoder;
    encode(input?: string): Uint8Array;
  };
}

export {};
