# Twitter Bot Firebase Functions

This repository contains Firebase Functions for a Twitter bot that interacts with the Twitter API to post tweets and handle OAuth2 authentication.

## Setup Guide

### Prerequisites

- Node.js (v14 or later)
- Firebase CLI
- A Firebase project
- Twitter Developer account with API keys

### Installation

1. **Clone the repository:**

    ```sh
    git clone <repository-url>
    cd <repository-directory>
    ```

2. **Install dependencies:**

    ```sh
    npm install
    ```

3. **Set up Firebase:**

    ```sh
    firebase login
    firebase init
    ```

    - Select `Functions` and follow the prompts to set up Firebase Functions in your project.

4. **Configure environment variables:**

    Create a `.env` file in the root directory and add your Twitter API credentials:

    ```env
    TWITTER_CLIENT_ID=your-client-id
    TWITTER_CLIENT_SECRET=your-client-secret
    CALLBACK_URL=http://localhost:5000/your-project-id/us-central1/callBack
    ```

5. **Deploy Firebase Functions:**

    ```sh
    firebase deploy --only functions
    ```

### Usage

- **OAuth2 Authentication:**

    The `auth` function generates an OAuth2 authentication link and stores the code verifier and state in Firestore.

    ```typescript
    export const auth = onRequest(async (request: Request, response: e.Response<any>) => {
        // Implementation
    });
    ```

- **Callback Handling:**

    The `callBack` function handles the OAuth2 callback, exchanges the code for tokens, and stores them in Firestore.

    ```typescript
    export const callBack = onRequest(async (request: Request, response: e.Response<any>) => {
        // Implementation
    });
    ```

- **Tweet Posting:**

    The `tweetRequest` function posts a tweet using the stored tokens.

    ```typescript
    export const tweetRequest = onRequest(async (request: Request, response: e.Response<any>) => {
        await tweeter(response);
    });
    ```

### Firestore Structure

- `tokens/entries`: Stores OAuth2 tokens and state.
- `tweets`: Stores posted tweets to avoid duplicates.

### Notes

- Ensure you have the necessary permissions for the Twitter API scopes: `tweet.read`, `tweet.write`, `users.read`, `offline.access`.
- Uncomment and configure the OpenAI integration if you have access to the API.

### License

This project is licensed under the MIT License.
