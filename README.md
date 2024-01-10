# Domain Genie

Domain Genie is a fun side project I used to learn Next.js and generative AI techniques for building postive user experience.
It's a simple application that helps people generate ideas for a domain name. They can enter a description about their
business or club and Domain Genie will come up with some possible domain names. It even checks if the name is available.

## Cool tech used

- Next.js as a full stack framework
- OpenAI Chat-GPT generative AI
- Generative AI streaming user experience
- Generative AI prompting and integration
- Rapid API integration
- Vercel KV + Upstash rate limiting

## 🤝 Contributing

Clone the repo.

Add a .env.local file with the follwing variables:

- _OPENAI_API_KEY_: An OpenAI key with access to gpt-3.5-turbo and funds to call the algorithm
- _RAPIDAPI_KEY_: A Rapid API key to account subscribed to the Domainr API
- _KV_URL_: The URL to a Vercel KV instance
- _KV_REST_API_URL_: The REST API URL to a Vercel KV instance
- _KV_REST_API_TOKEN_: The REST API token to a Vercel KV instance
- _KV_REST_API_READ_ONLY_TOKEN_: The REST API read only token to a Vercel KV instance

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Submit a pull request

If you'd like to contribute, please fork the repository and open a pull request to the `main` branch.
