import { bytesToHex } from "@stacks/common";
import { hashMessage, verifyMessageSignatureRsv } from "@stacks/encryption";
import {
  createMessageSignature,
  publicKeyFromSignatureRsv,
} from "@stacks/transactions";

export const validateSig = (signature: string, message: string) => {
  const hash = bytesToHex(hashMessage(message));
  const publicKey = publicKeyFromSignatureRsv(
    hash,
    createMessageSignature(signature),
  );

  const isSigValid = verifyMessageSignatureRsv({
    signature,
    message,
    publicKey,
  });

  return { isSigValid, publicKey };
};
