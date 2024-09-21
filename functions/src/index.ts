/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import { Request } from "firebase-functions/v1";
import admin from "firebase-admin";
import { TwitterApi } from "twitter-api-v2";
import * as e from "express";
import { onDocumentCreated } from "firebase-functions/firestore";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

onDocumentCreated(
  {
    document: "tokens/entries",
    region: "europe-west2",
  },
  (event) => {}
);

admin.initializeApp();
const dbRef = admin.firestore().doc("tokens/entries");

const twitterClient = new TwitterApi({
  clientId: "UE1TbnRlQmZiQjRIZWhyVFFndDg6MTpjaQ",
  clientSecret: "EGafv90k6hFtBSoZDF9HBJTfKr_re2a0BQR8HOTEynvZci9VZ7",
});

const callBackUrl =
  "http://localhost:5000/salih-twitter-bot/us-central1/callBack";

export const auth = onRequest(
  async (request: Request, response: e.Response<any>) => {
    const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
      callBackUrl,
      { scope: ["tweet.read", "tweet.write", "users.read", "offline.access"] }
    );
    await dbRef.set({ codeVerifier, state });
    response.redirect(url);
  }
);
export const callBack = onRequest(
  (request: Request, response: e.Response<any>) => {}
);

export const tweet = onRequest(
  (request: Request, response: e.Response<any>) => {}
);
