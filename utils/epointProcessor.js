const crypto = require("crypto");

// <<<<<<<<<<<<< ATTENTION >>>>>>>>>>>>>>
// THIS IS ONLY USED FOR TESTING PURPOSES
// DO NOT USE THIS IN PRODUCTION
// <<<<<<<<<<<<< ATTENTION >>>>>>>>>>>>>>

require("dotenv").config();

const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const epointRequest = "https://epoint.az/api/1/request";
const epointCheckout = "https://epoint.az/api/1/checkout";
const epointGetStatus = "https://epoint.az/api/1/get-status";

const sha1 = crypto.createHash("sha1");
// example

const data = {
  public_key: PUBLIC_KEY,
  amount: "1.00",
  currency: "AZN",
  description: "Paying for the glory of the Baristica empire",
  order_id: "1",
  language: "az",
};

data64 = Buffer.from(JSON.stringify(data)).toString("base64");

sha1.update(PRIVATE_KEY + data64 + PRIVATE_KEY, "utf8");
const signature = sha1.digest("base64");
console.log(signature + "\n\n");

const epointProcessor = () => {
  const queryParams = new URLSearchParams({
    data: data64,
    signature: signature,
  });

  const requestUrl = `${epointRequest}?${queryParams.toString()}`;
  console.log(requestUrl);

  fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((json) => {
      console.log(json);

      // sleep for 5 seconds and get-statuss
      setTimeout(() => {
        const data = {
          public_key: PUBLIC_KEY,
          transaction: json.transaction,
        };

        const data64 = Buffer.from(JSON.stringify(data)).toString("base64");
        const anotherSha1 = crypto.createHash("sha1");
        anotherSha1.update(PRIVATE_KEY + data64 + PRIVATE_KEY, "utf8");
        const signature = anotherSha1.digest("base64");

        const queryParams = new URLSearchParams({
          data: data64,
          signature: signature,
        });

        const getStatusUrl = `${epointGetStatus}?${queryParams.toString()}`;

        // fetch(getStatusUrl, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        // })
        //   .then((res) => res.json())
        //   .then((json) => {
        //     console.log(json);
        //   })
        //   .catch((err) => {
        //     console.log(err);
        //   });
      }, 5000);
    })
    .catch((err) => {
      console.log(err);
    });
};

epointProcessor();
