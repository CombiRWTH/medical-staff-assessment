# Frontend

## Getting Started

1. Download [node.js](https://nodejs.org/en)
2. Install Dependencies

```shell
npm install
```

3. Run the development server

```shell
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The frontend **requires** a configured **backend** on the api url (see config below).

If you don't want to set up your own backend you can start the development setup with `docker compose up` from
the [main directory](../).

### Used frame works and libraries

- [Next.js](https://nextjs.org/) to run the server
- [react](https://react.dev/) for dynamic behavior
- [lucide](https://lucide.dev/) for icons
- [tailwindcss](https://tailwindcss.com/) for styling ([config file](tailwind.config.ts))

### Config

The API URL can be changed in the [config file](src/config.ts).

### Project structure

- [page](pages): the pages with dynamic url parameter parsing
- [public](public): public assets like the favicon, fonts or additional css
- [src/api](src/api): react hooks to access the API
- [src/data-models](src/data-models) data models used within the application
- [src/components](src/components): reusable react components for functionality
- [src/layout](src/layout): reusable react components for basic page layouts
- [src/util](src/util): utility functions to make life easier
