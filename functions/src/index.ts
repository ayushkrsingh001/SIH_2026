import * as functions from 'firebase-functions';
import { fetchAndProcessNews } from './newsFetcher';

// Runs every 6 hours
export const scheduledNewsFetch = functions.pubsub
  .schedule('every 6 hours')
  .onRun(async (context) => {
    console.log('Starting scheduled news fetch...');
    await fetchAndProcessNews();
    console.log('Finished scheduled news fetch.');
    return null;
  });

// HTTP trigger for manual testing without waiting 6 hours
export const manualNewsFetch = functions.https.onRequest(async (req, res) => {
  console.log('Starting manual news fetch...');
  await fetchAndProcessNews();
  console.log('Finished manual news fetch.');
  res.send({ success: true, message: 'Manual fetch triggered and completed.' });
});
