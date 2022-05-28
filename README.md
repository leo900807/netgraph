# Netgraph Project

## Current development version

Node.js: v14.19.1

## Installation

**This project is collaborate with [Netgraph Template Generator](https://github.com/leo900807/netgraph-template-generator).**

#### 1. Install prerequisites

```bash
$ sudo apt-get install nodejs redis
```

#### 2. Clone netgraph project

```bash
$ git clone https://github.com/leo900807/netgraph.git
$ cd netgraph
```

#### 3. Install node modules

```bash
$ npm install
```

#### 4. Edit database settings

Edit `src/data-source.ts`

- SQLite
    ```javascript
    {
        type: "sqlite",
        database: "database.sqlite",
        synchronize: true,
        logging: false,
        entities: [
            "./src/entity/*.ts"
        ],
        migrations: [
            "./src/migration/*.ts"
        ],
        subscribers: []
    }
    ```

- MySQL
    ```javascript
    {
        type: "mysql",
        host: "localhost",
        port: 3306,
        username: "test",
        password: "test",
        database: "test",
        entities: [
            "./src/entity/*.ts"
        ],
        migrations: [
            "./src/migration/*.ts"
        ],
        subscribers: []
    }
    ```

More database configurations can be found [here](https://typeorm.io/data-source-options).

#### 5. Edit environment variables

Copy `.env_sample` to `.env` and edit variable values.

Further information about Gmail API can be found [here](https://developers.google.com/gmail/api).

#### 6. Run

**In `src/view/index.ejs`, there are multi includes at the end of the file. It should be replaced to correspond templates.**

```bash
$ npm start
```
