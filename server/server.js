const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const Pusher = require('pusher');
const { getCode, getName } = require('country-list');
const dialogflow = require('dialogflow');
const NewsAPI = require('newsapi');
const dlv = require('dlv');

dotenv.config({ path: './config.env' });
// const config = require('./config/dev');

const newsapi = new NewsAPI(String(process.env.newsapi_key));

const projectId = String(process.env.googleProjectID);
const sessionId = String(process.env.dialogFlowSessionID);
const languageCode = 'en-US';

const sessionClient = new dialogflow.SessionsClient();
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

// build query for getting an Intent
const buildQuery = function (query) {
  return {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode,
      },
    },
  };
};

// use data from intent to  fetch news
const fetchNews = function (intentData) {
  // console.log(intentData);
  let q = '';
  let country = '';
  const category = dlv(intentData, 'category.stringValue', 'general');
  const sources = dlv(intentData, 'source.stringValue');
  const keyword = dlv(intentData, 'keyword.stringValue', '').toLowerCase();
  if (getCode(keyword)) country = getCode(keyword).toLowerCase();
  else q = keyword;

  console.log(category, country, q, sources);
  return newsapi.v2.topHeadlines({
    category,
    language: 'en',
    q,
    sources,
    country,
  });
};

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 5000;

const pusher = new Pusher({
  appId: String(process.env.pusher_app_id),
  key: String(process.env.pusher_key),
  secret: String(process.env.pusher_secret),
  cluster: 'ap2',
  encrypted: true,
});
app.get('/', function (req, res) {
  return 'Server is up and running';
});
app.post('/message', function (req, res) {
  sessionClient
    .detectIntent(buildQuery(req.body.message))
    .then((responses) => {
      console.log('Detected intent');
      // console.log(responses[0].queryResult);
      if (responses[0].queryResult.intent.displayName !== 'news.search') {
        pusher.trigger('news', 'welcome', responses[0].queryResult.fulfillmentText);
      } else {
        const result = dlv(responses[0], 'queryResult');
        const intentData = dlv(responses[0], 'queryResult.parameters.fields');

        // if there's a result and an intent
        if (result && result.intent) {
          fetchNews(intentData)
            .then((news) => {
              // console.log(news.articles);
              return news.articles;
            })
            .then((articles) => pusher.trigger('news', 'news-update', articles.splice(0, 6))) //6 Headlines
            .then(() => console.log('published to pusher'));
        } else {
          console.log(`  No intent matched.`);
        }
        return res.sendStatus(200);
      }
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
});

app.listen(port, function () {
  console.log(`Server running at port ${port}`);
});
