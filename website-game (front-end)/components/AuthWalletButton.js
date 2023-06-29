import React from "react";

import { ethers } from "ethers";
import { useMoralis } from "react-moralis";

export default function AuthWalletButton() {
  const auth = async () => {
    try {
      const response = await fetch("http://localhost:3005/api/auth/nonce", {
        method: "GET",
      });
      console.log(response);

      // Step 1: Get the user's address from MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = signer.address;

      // Step 2: Sign the nonce
      const data = await response.json();
      const nonce = data.nonce;
      const signature = await signer.signMessage(`${nonce}`);

      // Step 3: Send the address, nonce, and signature to the server
      const authResponse = await fetch(
        "http://localhost:3005/api/auth/authenticate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address, nonce, signature }),
        }
      );
      console.log(authResponse);

      // Saving to cookies.
      const authData = await authResponse.json();
      const currentDate = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      const nextDay = new Date(currentDate.getTime() + oneDay);
      const expiration = await nextDay.toUTCString();

      let cookieString = `bfnftjwt=${authData.token}; expires=${expiration}; path=/;`;
      // Disable secure flag in development
      cookieString += " secure=false;";
      document.cookie = cookieString;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <button
      onClick={async () => {
        await auth();
      }}
    >
      VERIFY OWNERSHIP OF WALLET
    </button>
  );
}
