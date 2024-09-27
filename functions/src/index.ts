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
import { tweetArray, controversialTweetArray } from "./tweetArrays";
// import OpenAI from "openai";

onDocumentCreated(
  {
    document: "tokens/entries",
    region: "europe-west2",
  },
  (event) => {}
);

admin.initializeApp();

const dbRef = admin.firestore().doc("tokens/entries");
const twitterDb = admin.firestore().collection("tweets");

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
    await dbRef.set({
      codeVerifier,
      state,
      createdAt: admin.firestore.Timestamp.now(),
    });

    response.redirect(url);
  }
);
export const callBack = onRequest(
  async (request: Request, response: e.Response<any>) => {
    const { state, code } = request.query;

    const dbSnapshot = await dbRef.get();
    const data = dbSnapshot.data();

    if (!data) {
      response.status(404).send("Data not found");
      return;
    }

    const { codeVerifier, state: storedState } = data;

    if (state !== storedState) {
      response.status(403).send("Invalid state");
    }

    const {
      client: loggedClient,
      accessToken,
      refreshToken,
    } = await twitterClient.loginWithOAuth2({
      code: code as string,
      codeVerifier,
      redirectUri: callBackUrl,
    });

    await dbRef.set({
      accessToken,
      refreshToken,
      createdAt: admin.firestore.Timestamp.now(),
    });

    const { data: profileData } = await loggedClient.v2.me(); // start using the client if you want

    response.send(profileData);
  }
);

export const tweetRequest = onRequest(
  async (request: Request, response: e.Response<any>) => {
    await tweeter(response);
  }
);

const tweeter = async (response: e.Response<any>) => {
  try {
    const databaseData = (await dbRef.get()).data();

    if (!databaseData) {
      response.status(404).send("Data not found");
      return;
    }

    const { refreshToken } = databaseData;

    const {
      client: refreshedClient,
      accessToken,
      refreshToken: newRefreshToken,
    } = await twitterClient.refreshOAuth2Token(refreshToken);

    await dbRef.set({
      accessToken,
      refreshToken: newRefreshToken,
    });

    // const openai = new OpenAI({
    //   apiKey: process.env.SECRET_API_KEY,
    //   organization: process.env.ORGANIATION_ID,
    //   project: process.env.PROJECT_ID,
    // });

    // const chatResponse = await openai.chat.completions.create({
    //   messages: [
    //     {
    //       role: "system",
    //       content:
    //         "You are a personal assistant that provides me with factual tweets on the following topics: \
    //           Programming, entrepreneurship, javascript, typescript, machine learning, ai and the latest tech trends. \
    //           The number of characters must be less than 140. There can be no emojis. The tweets must be factual and informative.\
    //           The tweet needs to have multiple hashtags with one of then being #buildinpublic.",
    //     },
    //     { role: "user", content: "Say this is a test" },
    //   ],
    //   model: "gpt-4o-mini",
    // });

    // console.log("Response --------------------> ", chatResponse);

    const totalTweetArrays = [tweetArray, controversialTweetArray];

    const selectedTweetArray =
      totalTweetArrays[Math.floor(Math.random() * totalTweetArrays.length)];

    const randomIndex = Math.floor(Math.random() * selectedTweetArray.length);

    const tweetExists = await twitterDb
      .doc(selectedTweetArray[randomIndex])
      .get();

    if (tweetExists.exists) {
      // re-run the function

      await tweeter(response);
    }

    twitterDb.doc(selectedTweetArray[randomIndex]).set({
      createdAt: admin.firestore.Timestamp.now(),
    });

    const tweet = await refreshedClient.v2.tweet(
      selectedTweetArray[randomIndex]
    );

    response.status(200).send(tweet);
  } catch (error) {
    console.error("Error occurred: ", error);
    response.status(500).send(error);
  }
};
