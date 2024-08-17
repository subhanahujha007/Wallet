"use client";

import nacl from "tweetnacl";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import { useState, useEffect } from "react";
import { ethers,HDNodeWallet } from "ethers";

export default function Home() {
  const [solUser, setSolUser] = useState([]);
  const [ethUser, setEthUser] = useState([]);
  const [ethwalletNumber, ethsetWalletNumber] = useState(0);
  const [solwalletNumber, solsetWalletNumber] = useState(0);
  const [mnemonicInput, setMnemonicInput] = useState(Array(12).fill(""));
  const [mnemonic, setMnemonic] = useState("");
  const [isMnemonicSubmitted, setIsMnemonicSubmitted] = useState(false);
  const seed = mnemonic ? mnemonicToSeedSync(mnemonic) : null;

  // Generate mnemonic on component mount
  useEffect(() => {
    const generatedMnemonic = generateMnemonic();
    setMnemonicInput(generatedMnemonic.split(" "));
    setMnemonic(generatedMnemonic);
  }, []);

  const handleMnemonicChange = (e, index) => {
    const newMnemonicInput = [...mnemonicInput];
    newMnemonicInput[index] = e.target.value;
    setMnemonicInput(newMnemonicInput);
  };

  const handleSubmitMnemonic = () => {
    setMnemonic(mnemonicInput.join(" "));
    setIsMnemonicSubmitted(true);
  };

  const handleCreateSolWallet = () => {
    if (!seed) return;

    const path = `m/44'/501'/${solwalletNumber}'/0'`;
    const derivedSeed = derivePath(path, seed.toString("hex")).key;
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    const newUserKey = Keypair.fromSecretKey(secret).publicKey.toBase58();

    setSolUser(prevUser => [...prevUser, { publicKey: newUserKey, solwalletNumber }]);
    solsetWalletNumber(solwalletNumber + 1);
  };

  const handleCreateEthWallet = () => {
    if (!mnemonic) return;

    const path = `m/44'/60'/${ethwalletNumber}'/0'`;
    const seed = mnemonicToSeedSync(mnemonic);
    const hdNode = HDNodeWallet.fromSeed(seed)
    const childNode = hdNode.derivePath(path);
    const wallet = new ethers.Wallet(childNode.privateKey);

    setEthUser(prevUser => [...prevUser, { address: wallet.address, ethwalletNumber }]);
    ethsetWalletNumber(ethwalletNumber + 1);
  };

  return (
    <div className="text-bold flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center justify-center">
        <h1>Enter your 12-word mnemonic phrase</h1>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {mnemonicInput.map((word, index) => (
            <input
              key={index}
              type="text"
              value={word}
              onChange={(e) => handleMnemonicChange(e, index)}
              className="p-2 border rounded"
              placeholder={`Word ${index + 1}`}
            />
          ))}
        </div>
        <button 
          className="underline mt-4"
          onClick={handleSubmitMnemonic}
        >
          Submit Mnemonic
        </button>
      </div>

      {isMnemonicSubmitted && (
        <div className="flex flex-col items-center mt-4 gap-6">
          <button 
            className="underline mb-4" 
            onClick={handleCreateSolWallet}
            disabled={!mnemonic}
          >
            Click here to Create a new Solana wallet
          </button>

          <div className="flex flex-wrap justify-center gap-4 max-w-[90vw]">
            {solUser.map((item, index) => (
              <div key={index} className="bg-green-400 p-4 rounded-md flex-shrink-0">
                <h1>Solana Wallet no: {item.solwalletNumber}</h1>
                <p>Public key:</p>
                <h1>{item.publicKey}</h1>
              </div>
            ))}
          </div>

          <button 
            className="underline mb-4" 
            onClick={handleCreateEthWallet}
            disabled={!mnemonic}
          >
            Click here to Create a new Ethereum wallet
          </button>

          <div className="flex flex-wrap justify-center gap-4 max-w-[90vw]">
            {ethUser.map((item, index) => (
              <div key={index} className="bg-blue-400 p-4 rounded-md flex-shrink-0">
                <h1>Ethereum Wallet no: {item.ethwalletNumber}</h1>
                <p>Address:</p>
                <h1>{item.address}</h1>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
