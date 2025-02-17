import QueryBuilder from 'eloquent-query-builder';
import { createPool } from 'mysql2/promise';
import { Sequelize, Dialect } from 'sequelize';

const host = process.env.DB_HOST
const user = process.env.DB_USER
const password = process.env.DB_PASSWORD
const database = process.env.DB_NAME

export const MYSQL = createPool({
    host,
    user,
    password,
    database,
})

const options: { host: string; logging: boolean; dialect: Dialect } = {
    host,
    logging: false,
    dialect: 'mysql',
}

const sequelize = new Sequelize(database, user, password, options);
export const createQueryBuilder = () => {
    const queryBuilder = new QueryBuilder(sequelize);

    // Simpan referensi ke metode orWhere asli
    const originalOrWhere = queryBuilder.orWhere;

    // Override fungsi orWhere
    queryBuilder.orWhere = function (...args: any[]) {

        if (!queryBuilder.query || !queryBuilder.whereParams) {
            throw new Error('Where clause must be defined before using orWhere');
        }

        const operatorAndVal = args.length > 2 ? ` ${args[1]} ${queryBuilder.getStrParam(args[2])}` : ` = ${queryBuilder.getStrParam(args[1])}`;

        const qryString = ` OR ${args[0]}${operatorAndVal}`;
        queryBuilder.orWhereParams.push(qryString);
        queryBuilder.query += qryString;

        // Panggil fungsi asli dengan konteks yang telah dimodifikasi
        return originalOrWhere.apply(this, args);
    };

    return queryBuilder;
};
