import { hash, compare } from "bcryptjs";
import { generateKeyPairSync } from "crypto";

/**
 * Asynchronously generates a hash for the given password.
 * @param password Password to hash
 * @param salt     Salt length to generate or salt to use
 * @return Promise with resulting hash, if callback has been omitted
 */
export const hashPassword = async (
  strPassword: string,
  intSalt = 10
): Promise<string> => {
  return await hash(strPassword, intSalt);
};

/**
 * Asynchronously tests a password against a hash.
 * @param  password Password to test
 * @param  hash     Hash to test against
 * @return Promise, if callback has been omitted
 */

export const comparePassword = async (
  strPassword: string,
  strHash: string
): Promise<boolean> => {
  return await compare(strPassword, strHash);
};
/**
 *
 * @param param0
 * @returns
 */
export type TgeneratePubPrivKeyPair = () => {
  strPublicKey: string;
  strPrivateKey: string;
};

/**
 * Generates a public and private key pair.
 * @returns The public and private key pair.
 */
export const generatePubPrivKeyPair = () =>
  // {
  //   strType = "rsa",
  //   strFormat = "pem",
  // }: {
  //   strType: KeyType;
  //   strFormat: KeyFormat;
  // }
  {
    const { publicKey, privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
        // cipher: "aes-256-cbc",  this two key not use 
        // passphrase: "top secret",
      },
    });
    return { strPublicKey: publicKey, strPrivateKey: privateKey };
  };
