const connection_web3 = new solanaweb3.Connection("https://api.devnet.solana.com");
import * as anchor from "@project-serum/anchor";
import express, { json } from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from "cors";
import mysql from "mysql";
import http from 'http';
import { Server } from 'socket.io';

import {
    PublicKey,
    Keypair,
    Connection,
    Transaction,
    clusterApiUrl,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    // TransactionSignature,
    TransactionInstruction,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction
} from "@solana/web3.js";
import solanaweb3 from "@solana/web3.js";
import bs58 from "bs58";
// import { toast } from "react-toastify";
import dotenv from 'dotenv'
import { createClient } from "@supabase/supabase-js";


dotenv.config({ path: ".env" });
const supabaseUrl = "https://inqjbgvohbioletfhmna.supabase.co";
export const supabase = createClient(
  supabaseUrl,
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlucWpiZ3ZvaGJpb2xldGZobW5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkwOTk1MjIsImV4cCI6MjAyNDY3NTUyMn0.YxTqdgTdgZvv5noMygURCqfyRwZvce1PrZLS52l4eT8"
);
export const supabaseAdmin = createClient(
  supabaseUrl,
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlucWpiZ3ZvaGJpb2xldGZobW5hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwOTA5OTUyMiwiZXhwIjoyMDI0Njc1NTIyfQ.s1cEXWTFlr5-GU87cp7l6DsbNabM_8Ded9Dkh23uM78"
);

const app = express();
const PORT = process.env.PORT || 3000
const { BN } = anchor.default;
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors({}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
      // origin: 'https://humble-halibut-4wv5p96jj427pg9-5173.app.github.dev',
      // origin: ['http://127.0.0.1:5173', "https://pebble-betting.vercel.app"],
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  
  const CHAT_BOT = "ChatBot";
  let chatRoom = ""; // E.g. javascript, node,...
  let allUsers = []; // All users in current chat room
  
  io.on("connection", (socket) => {
    console.log(`User connected`);
    
    let __createdtime__ = Date.now(); // Current timestamp
    
    socket.on("join_room", (data) => {
      let chatRoomUsers = [{ username: "", room: "" }];
      const { username, user_id, avatar, room } = data; // Data sent from client when join_room event emitted
      chatRoom = room;
      if (
        !allUsers.find((user) => {
          return user.username === username && user.room === room;
        })
      ) {
        allUsers.push({ username, user_id, avatar, room });
        chatRoomUsers = allUsers.filter((user) => user.room === room);
        console.log("user joined room");
      } else {
        console.log("user already joined");
      }
      socket.join(room); // Join the user to a socket room
      socket.to(room).emit("chatroom_users", allUsers);
      socket.emit("chatroom_users", allUsers);
  
      // Send message to all users currently in the room, apart from the user that just joined
      // socket.to(room).emit("receive_message", {
      //   message: `${username} has joined the chat room`,
      //   username: CHAT_BOT,
      //   __createdtime__,
      // });
  
      // socket.emit("receive_message", {
      //   message: `Welcome ${username}`,
      //   username: CHAT_BOT,
      //   __createdtime__,
      // });
    });
  
    socket.on("send_message", async (data) => {
      const { room, user_id, message } = data;
      console.log("sdkl1");
      io.in(room).emit("receive_message", data);
      console.log("sdskfsd");
      const { error } = await supabase.from("chats").insert({
        user_id,
        message,
        room,
      });
      error && console.log("failed to save message due to: ", error.message);
    });
  });

const pebble_count = 8;
const hamster_count = 4;
let total_amount = 0;
var total_each_pebble = [0, 0, 0, 0, 0, 0, 0, 0];
let total_amount_hamster = 0;
var total_each_pebble_hamster = [0, 0, 0, 0];

let expected_winner_pebble = 1;
let expected_winner_hamster = 1;
let betting_marble_Flag = false;
let betting_hamster_Flag = false;
let last_marble_vetting_result = [1, 2, 3, 4, 5, 6, 7, 8];
let last_hamster_vetting_result = [1, 2, 3, 4];
const MARBLE_LIST = [
    "Moscow",
    "NewYork",
    "Paris",
    "CapeTown",
    "RiodeJaneiro",
    "Sydney",
    "Cairo",
    "Tokyo"
];

const HAMSTER_LIST = [
    "Ckay",
    "Larry",
    "Sergeant",
    "Rookie"
];

// create a connection object
let connection = mysql.createConnection({
    host: '127.0.0.1',
    post: 3306,
    user: 'root',
    password: 'password',
    database: 'mydb'
});

// connect to the database
connection.connect((err) => {
    if (err) return console.error(err.message);
    console.log('Connected to the MySQL server.');
});

// define a CREATE TABLE statement
let createTable = `CREATE TABLE WinningRate (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pebble_num INT NOT NULL,
    winning_count INT NOT NULL,
    total_betted_amount FLOAT NOT NULL,
    winning_betted_amount FLOAT NOT NULL
    )`;

// execute the CREATE TABLE statement
connection.query(createTable, (err, result) => {
    if (err) return console.error(err.message);
    console.log('Table created');
});


// define a CREATE TABLE statement
let createTable1 = `CREATE TABLE WinningRate1 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pebble_num INT NOT NULL,
    winning_count INT NOT NULL,
    total_betted_amount FLOAT NOT NULL,
    winning_betted_amount FLOAT NOT NULL
    )`;

// execute the CREATE TABLE1 statement
connection.query(createTable1, (err, result) => {
    if (err) return console.error(err.message);
    console.log('Table created');
});

// define a CREATE TABLE statement
let createTable2 = `CREATE TABLE bettingInfo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bettor_pubkey VARCHAR(256) NOT NULL,
    pebble_number INT NOT NULL,
    pebble_deposit_amount FLOAT NOT NULL
    )`;

// execute the CREATE TABLE statement
connection.query(createTable2, (err, result) => {
    if (err) return console.error(err.message);
    console.log('Table created');
});

// define a CREATE TABLE statement
let createTable3 = `CREATE TABLE bettingInfo1 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bettor_pubkey VARCHAR(256) NOT NULL,
    hamster_number INT NOT NULL,
    hamster_deposit_amount FLOAT NOT NULL
    )`;

// execute the CREATE TABLE statement
connection.query(createTable3, (err, result) => {
    if (err) return console.error(err.message);
    console.log('Table created');
});



function formatDb() {
    return new Promise((resolve) => {
        var tableName = "WinningRate";

        connection.query(`TRUNCATE TABLE ${tableName}`, (truncateErr, results) => {
            if (truncateErr) {
                console.error('Error truncating table:', truncateErr);
            } else {
                console.log(`${tableName} truncating success`)
                var tableName1 = "WinningRate1";

                connection.query(`TRUNCATE TABLE ${tableName1}`, (truncateErr, results) => {
                    if (truncateErr) {
                        console.error('Error truncating table:', truncateErr);
                    } else {
                        console.log(`${tableName1} truncating success`)
                        resolve(true);
                    }
                });
            }
        });
    })
}

async function initDatabaseWinningRate1() {
    var pool = mysql.createPool({
        connectionLimit: 100,
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'mydb',
        timezone: 'Z'
    });
    var insertQuery = `INSERT INTO WinningRate1 (pebble_num, winning_count, total_betted_amount, winning_betted_amount) VALUES (?, ?, ?, ?)`;
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            return reject(err);
        }
        connection.on('error', function (err) {
            console.log('>>> error >>>', err);
        });
        for (let i = 0; i < 4; i++) {
            const values = [i + 1, 0, 0, 0];
            connection.query(insertQuery, values, (err, result) => {
                if (err) {
                    console.error('Error inserting data into MySQL:', err);
                    throw err;
                }
                console.log('Data inserted successfully:', result);
            });
        }
    });
}

async function initDatabaseWinningRate() {
    var pool = mysql.createPool({
        connectionLimit: 100,
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'mydb',
        timezone: 'Z'
    });

    var insertQuery = `INSERT INTO WinningRate (pebble_num, winning_count, total_betted_amount, winning_betted_amount) VALUES (?, ?, ?, ?)`;
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            return reject(err);
        }
        connection.on('error', function (err) {
            console.log('>>> error >>>', err);
        });
        for (let i = 0; i < 8; i++) {
            const values = [i + 1, 0, 0, 0];
            connection.query(insertQuery, values, (err, result) => {
                if (err) {
                    console.error('Error inserting data into MySQL:', err);
                    throw err;
                }
                console.log('Data inserted successfully:', result);
            });
        }

    });

}

async function start() {
    const result = await formatDb();
    console.log(result)
    if (result === true) {
        await initDatabaseWinningRate();
        await initDatabaseWinningRate1();
    }
}


async function bettingEnd(bet_id) {
    let wallet = solanaweb3.Keypair.fromSecretKey(
        bs58.decode(
            "4gi21wohHz8MJ4jhiiSL9Rs7kCpvxUitYxNheHKP3CQS6jeNfMpV4nCfQUJ861cz7zw8dXdbfnQvitrpbb12yxKF"
        )
    );
    var pool = mysql.createPool({
        connectionLimit: 100,
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'mydb',
        timezone: 'Z'
    });

    var winners = [];
    var rewards = [];

    // try {
    if (bet_id === "bet") {
        betting_marble_Flag = false;
        var selectAll = "SELECT * FROM bettingInfo";
        var total_each_pebble_t = [0, 0, 0, 0, 0, 0, 0, 0];
        connection.query(selectAll, (err, result, fields) => {
            if (err) return console.error(err.message);
            let data = result.map(row => Object.values(row));
            let d_len = data.length;
            for (let i = 0; i < d_len; i++) {
                if (parseInt(data[i][2]) == expected_winner_pebble)
                    total_each_pebble_t[expected_winner_pebble - 1] += parseFloat(data[i][3]);
            }
        });

        var sql = "SELECT * FROM bettingInfo WHERE pebble_number = ?";
        const value_1 = [expected_winner_pebble];
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            connection.on('error', function (err) {
                console.log('>>> error >>>', err);
            });

            connection.query(sql, value_1, (err, results) => {
                if (err) {
                    console.error('Error executing query:', err);
                    throw err;
                }
                // Log the retrieved data
                console.log('>>>>>>>>>>>>betting end>>>>>>>>>>> Retrieved data:', results);
                let data = results.map(row => Object.values(row));
                console.log(">>>>>>>>>>>>betting end>>>>>>>>>>>", data);
                let total_distribution = total_amount * 95 / 100;
                let d_len = data.length;
                console.log(">>>>>>>>>>>>betting end>>>>>>>>>>>", d_len);
                let reward = [];
                //distribution
                for (let i = 0; i < d_len; i++) {
                    reward[i] = total_distribution * parseFloat(data[i][3]) / total_each_pebble_t[expected_winner_pebble - 1];
                    var referralKey = data[i][1];
                    winners[i] = referralKey;
                    rewards[i] = reward[i];
                    // transferSol(senderWallet.publicKey, data[i][1], parseInt(reward[i]));
                    (async () => {
                        console.log("Transaction Start!!!");
                        const program = getProgram(wallet);
                        // console.log(program);
                        const value = new BN(reward[i] * LAMPORTS_PER_SOL);//new BN(reward[i] * 1000000000)
                        console.log(value);
                        const tx = new Transaction().add(
                            await program.methods
                                .transferSol(value)
                                .accounts({
                                    from: wallet.publicKey,
                                    to: referralKey,
                                    systemProgram: SystemProgram.programId,
                                })
                                .instruction()
                        );
                        console.log("transferSol end!!!!");
                        let txHash = await sendAndConfirmTransaction(connection_web3, tx, [wallet]);
                        console.log("txHAsh =", txHash);
                        return txHash;
                    })();
                }
            });
        });
        var selectRatingAllData = "SELECT * FROM WinningRate";

        let data = [];
        connection.query(selectRatingAllData, (err, result, fields) => {
            if (err) return console.error(err.message);
            // map the result object to an array of arrays
            data = result.map(row => Object.values(row));
            let d_len = data.length;
            for (let i = 0; i < d_len; i++) {
                // data[i][3] += total_each_pebble_t[i];
                // let updateData = [data[i][3], i + 1];
                // let sql = `UPDATE WinningRate SET total_betted_amount = ? WHERE pebble_num = ?`;
                // connection.query(sql, updateData, (error, results, fields) => {
                //     if (error) return console.error(error.message);
                // });
                if (expected_winner_pebble == i + 1) {
                    data[i][2] += 1;
                    data[i][4] += total_each_pebble_t[i];
                    let sql = `UPDATE WinningRate SET winning_count = ?, winning_betted_amount = ? WHERE pebble_num = ?`;
                    let updateData = [data[i][2], data[i][4], i + 1];
                    connection.query(sql, updateData, (error, results, fields) => {
                        if (error) return console.error(error.message);
                    });
                }
            }
            // log the data array
            console.log(">>>>>>>>>>>>betting end>>>>>>>>>>>bet", data);
        });
    }
    //////////////////////////////////////////////////////////////////
    else {
        betting_hamster_Flag = false;
        var selectAll = "SELECT * FROM bettingInfo1";
        var total_each_hamster_t = [0, 0, 0, 0];
        // execute the SELECT statement
        connection.query(selectAll, (err, result, fields) => {
            if (err) return console.error(err.message);
            // map the result object to an array of arrays
            var data = result.map(row => Object.values(row));
            var d_len = data.length;
            for (let i = 0; i < d_len; i++) {
                // total_amount += parseFloat(data[i][3]);
                if (parseInt(data[i][2]) == expected_winner_hamster)
                    total_each_hamster_t[expected_winner_hamster - 1] += parseFloat(data[i][3]);
            }
            // log the data array
            console.log("Database Data of Hamster", data);
        });

        sql = "SELECT * FROM bettingInfo1 WHERE hamster_number = ?";
        const value_2 = [expected_winner_hamster];
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            connection.on('error', function (err) {
                console.log('>>> error >>>', err);
            });

            connection.query(sql, value_2, (err, results) => {
                if (err) {
                    console.error('Error executing query:', err);
                    throw err;
                }
                // Log the retrieved data
                let data = results.map(row => Object.values(row));
                let total_distribution = total_amount_hamster * 95 / 100;
                console.log('>>>>>>>>>>> total_distribution', total_distribution);
                let d_len = data.length;
                let reward = [];
                // distribution
                for (let i = 0; i < d_len; i++) {
                    console.log('>>>>>>>>>>> parseFloat(data[i][3])', parseFloat(data[i][3]));
                    reward[i] = total_distribution * parseFloat(data[i][3]) / total_each_hamster_t[expected_winner_hamster - 1];
                    var referralKey = data[i][1];
                    winners[i] = referralKey;
                    rewards[i] = reward[i];

                    (async () => {
                        console.log("Transaction Start!!!");
                        const program = getProgram(wallet);
                        // console.log(program);
                        const value = new BN(reward[i] * LAMPORTS_PER_SOL);//new BN(reward[i] * 1000000000)
                        console.log('>>>>>>>>>>> reward transferSol', value);
                        const tx = new Transaction().add(
                            await program.methods
                                .transferSol(value)
                                .accounts({
                                    from: wallet.publicKey,
                                    to: referralKey,
                                    systemProgram: SystemProgram.programId,
                                })
                                .instruction()
                        );
                        console.log("transferSol end!!!!");
                        let txHash = await sendAndConfirmTransaction(connection_web3, tx, [wallet]);
                        console.log("txHAsh =", txHash);
                        return txHash;
                    })();
                }

            });
        });
        var selectRatingAllData = "SELECT * FROM WinningRate1";

        let data = [];
        connection.query(selectRatingAllData, (err, result, fields) => {
            if (err) return console.error(err.message);
            // map the result object to an array of arrays
            data = result.map(row => Object.values(row));
            console.log("WinningRate1 Database Data: ", data);
            let d_len = data.length;
            for (let i = 0; i < d_len; i++) {
                // data[i][3] += total_each_hamster_t[i];
                // let updateData = [data[i][3], i + 1];
                // let sql = `UPDATE WinningRate1 SET total_betted_amount = ? WHERE pebble_num = ?`;
                // connection.query(sql, updateData, (error, results, fields) => {
                //     if (error) return console.error(error.message);
                // });
                if (expected_winner_hamster == i + 1) {
                    data[i][2] += 1;
                    data[i][4] += total_each_hamster_t[i];
                    let sql = `UPDATE WinningRate1 SET winning_count = ?, winning_betted_amount = ? WHERE pebble_num = ?`;
                    let updateData = [data[i][2], data[i][4], i + 1];
                    connection.query(sql, updateData, (error, results, fields) => {
                        if (error) return console.error(error.message);
                    });
                }
            }
            // log the data array
            console.log("WinningRate1", data);
        });
    }
    // } catch (error) {
    //     console.error(error.message);
    // } finally {
    //     connection.end(); // Close MySQL connection
    // }

    return new Promise((resolve) => {
        setTimeout(() => {
            let results = [];

            for (let i = 0; i < winners.length; i++) {
                results.push({
                    betType: bet_id,
                    winner: winners[i],
                    reward: rewards[i]
                })
            };
            resolve(results);
        }, 100);
    });

    // return [winners, rewards];
}

const PROGRAM_ID = "624V3FNs96HeJwHGGNwTPLNRjhkvP48Vj9bgBuV4AZA4";

function getProgram(wallet) {
    let provider = new anchor.AnchorProvider(
        connection_web3,
        wallet,
        anchor.AnchorProvider.defaultOptions()
    );
    const program = new anchor.Program(IDL, PROGRAM_ID, provider);
    return program;
};

// function calWinner(deposit_pebble_num, deposit_amount) {
//     total_each_pebble[deposit_pebble_num - 1] = total_each_pebble[deposit_pebble_num - 1] + deposit_amount;
//     total_amount += deposit_amount;
//     console.log(total_each_pebble);
//     console.log(total_amount);
//     let winner_pebble = 0;
//     let winner_pebble_amount = total_each_pebble[0];
//     for (let i = 1; i < pebble_count; i++) {
//         if (total_each_pebble[i] < winner_pebble_amount) {
//             winner_pebble = i;
//             winner_pebble_amount = total_each_pebble[i];
//         }
//     }
//     return winner_pebble + 1;
// }

// function calWinner_hamster(deposit_pebble_num, deposit_amount) {
//     total_each_pebble_hamster[deposit_pebble_num - 1] = total_each_pebble_hamster[deposit_pebble_num - 1] + deposit_amount;
//     total_amount_hamster += deposit_amount;
//     console.log(total_each_pebble_hamster);
//     console.log(total_amount_hamster);
//     let winner_pebble_hamster = 0;
//     let winner_pebble_amount_hamster = total_each_pebble_hamster[0];
//     for (let i = 0; i < hamster_count; i++) {
//         if (total_each_pebble_hamster[i] < winner_pebble_amount_hamster) {
//             winner_pebble_hamster = i;
//             winner_pebble_amount_hamster = total_each_pebble_hamster[i];
//         }
//     }
//     return winner_pebble_hamster + 1;
// }

function deposit(deposit_amount, deposit_pebble_num, bettor) {
    console.log("Marble Deposit!", deposit_amount, deposit_pebble_num, bettor);
    // calWinner(deposit_pebble_num, deposit_amount);
    var pool = mysql.createPool({
        connectionLimit: 100,
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'mydb',
        timezone: 'Z'
    });
    total_amount += deposit_amount;
    var insertQuery = `INSERT INTO bettingInfo (bettor_pubkey, pebble_number, pebble_deposit_amount) VALUES (?, ?, ?)`;
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            return reject(err);
        }
        connection.on('error', function (err) {
            console.log('>>> error >>>', err);
        });

        const values = [bettor, deposit_pebble_num, deposit_amount];
        connection.query(insertQuery, values, (err, result) => {
            if (err) {
                console.error('Error inserting data into MySQL:', err);
                throw err;
            }
            console.log('Data inserted successfully:', result);
        });
    });

    var getQuery = `SELECT * FROM WinningRate WHERE pebble_num = ?`;
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            return reject(err);
        }
        connection.on('error', function (err) {
            console.log('>>> error >>>', err);
        });

        const values = [deposit_pebble_num];
        connection.query(getQuery, values, (err, result) => {
            if (err) {
                console.error('Error inserting data into MySQL:', err);
                throw err;
            }
            console.log('Retrieved data:', result);
            let data = result.map(row => Object.values(row));
            console.log(data);
            var send_data = data[0];
            console.log(send_data[3]);
            send_data[3] += deposit_amount;
            let sql = `UPDATE WinningRate SET total_betted_amount = ? WHERE pebble_num = ?`;
            let updateData = [send_data[3], deposit_pebble_num];
            connection.query(sql, updateData, (error, results, fields) => {
                if (error) return console.error(error.message);
                console.log('Rows affected:', results.affectedRows);
            });

        });
    });
    return 1;
}

function deposit_hamster(deposit_amount, deposit_pebble_num, bettor) {
    console.log("Hamster Deposit!", deposit_amount, deposit_pebble_num, bettor);
    // calWinner(deposit_pebble_num, deposit_amount);
    var pool = mysql.createPool({
        connectionLimit: 100,
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'mydb',
        timezone: 'Z'
    });
    total_amount_hamster += deposit_amount;

    var insertQuery = `INSERT INTO bettingInfo1 (bettor_pubkey, hamster_number, hamster_deposit_amount) VALUES (?, ?, ?)`;
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            return reject(err);
        }
        connection.on('error', function (err) {
            console.log('>>> error >>>', err);
        });

        const values = [bettor, deposit_pebble_num, deposit_amount];
        connection.query(insertQuery, values, (err, result) => {
            if (err) {
                console.error('Error inserting data into MySQL:', err);
                throw err;
            }
            console.log('Data inserted successfully:', result);
        });
    });

    var getQuery = `SELECT * FROM WinningRate1 WHERE pebble_num = ?`;
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            return reject(err);
        }
        connection.on('error', function (err) {
            console.log('>>> error >>>', err);
        });

        const values = [deposit_pebble_num];
        connection.query(getQuery, values, (err, result) => {
            if (err) {
                console.error('Error inserting data into MySQL:', err);
                throw err;
            }
            let data = result.map(row => Object.values(row));
            console.log("data: ", data);
            var send_data = data[0];
            console.log("send_data: ", send_data[3]);
            send_data[3] += deposit_amount;
            let sql = `UPDATE WinningRate1 SET total_betted_amount = ? WHERE pebble_num = ?`;
            let updateData = [send_data[3], deposit_pebble_num];
            connection.query(sql, updateData, (error, results, fields) => {
                if (error) return console.error(error.message);
                console.log('Rows affected:', results.affectedRows);
            });

        });
    });

    return 1;
}

app.get("/api/init", (req, res) => {
    console.log("Init Setting!!!");
    let betting_name = req.query.query;
    console.log(betting_name);
    let last_betting_result = [];
    if (betting_name === "bet") {
        console.log(last_marble_vetting_result);
        for (let i = 0; i < 8; i++) {
            console.log(last_marble_vetting_result[i], " : ", MARBLE_LIST[last_marble_vetting_result[i] - 1])
            last_betting_result[i] = MARBLE_LIST[last_marble_vetting_result[i] - 1];
        }
        res.json({ status: "success", msg: { betting_marble_Flag, last_betting_result } });
    }
    else {
        console.log("harrybet");
        for (let i = 0; i < 4; i++) {
            last_betting_result[i] = HAMSTER_LIST[last_hamster_vetting_result[i] - 1];

        }
        res.json({ status: "success", msg: { betting_hamster_Flag, last_betting_result } });
    }
    console.log(last_betting_result);

});

app.get("/api/onViewStat", (req, res) => {
    console.log("Get Detail!!!");
    let bet_id = req.query.query;
    let detail_number = req.query.number;
    console.log(bet_id, detail_number);

    var pool = mysql.createPool({
        connectionLimit: 100,
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'mydb',
        timezone: 'Z'
    });


    var send_data;
    console.log(detail_number);

    var getQuery = bet_id === "bet" ? `SELECT * FROM WinningRate WHERE pebble_num = ?` : `SELECT * FROM WinningRate1 WHERE pebble_num = ?`;
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            return reject(err);
        }
        connection.on('error', function (err) {
            console.log('>>> error >>>', err);
        });

        const values = [detail_number];
        connection.query(getQuery, values, (err, result) => {
            if (err) {
                console.error('Error inserting data into MySQL:', err);
                throw err;
            }
            console.log('Retrieved data:', result);
            let data = result.map(row => Object.values(row));
            console.log(data);
            send_data = data[0];
            console.log(send_data);
            res.json({ status: "success", msg: send_data });
        });
    });

});

// Create an endpoint to handle the frontend request
app.get("/api/deposit", (req, res) => {
    console.log("Betting arrived!!!");
    if (betting_marble_Flag || betting_hamster_Flag) {
        let deposit_amount = 0;
        let deposit_pebble_num = 0;
        deposit_amount = parseFloat(req.query.query);
        deposit_pebble_num = parseInt(req.query.pebble);
        let bettor = req.query.bettor;
        let bet_id = req.query.bet_id;
        console.log(deposit_amount, deposit_pebble_num, bet_id);

        if (bet_id === "bet") {
            if (betting_marble_Flag) {
                // expected_winner_pebble = calWinner(deposit_pebble_num, deposit_amount);
                console.log("expcted winner: ", expected_winner_pebble);
                if (deposit(deposit_amount, deposit_pebble_num, bettor)) {
                    res.json({ status: "success", msg: "success!!!" });
                }
            }
            else {
                res.json({ status: "false", msg: "invalid vetting time!" });
            }

        }
        else {
            if (betting_hamster_Flag) {
                // expected_winner_hamster = calWinner_hamster(deposit_pebble_num, deposit_amount);
                console.log("expcted winner: ", expected_winner_hamster);
                if (deposit_hamster(deposit_amount, deposit_pebble_num, bettor)) {
                    res.json({ status: "success", msg: "success!!!" });
                }
            }
            else {
                res.json({ status: "false", msg: "invalid vetting time!" });
            }
        }
    }
    else {
        res.json({ status: "false", msg: "invalid vetting time!" })
    }
});

app.get("/api/decidewinner", (req, res) => {
    console.log("Winner Decide Signal Arrived!!!");
    let bet_id = req.query.bet_id;

    if (bet_id === "bet") {
        if (betting_marble_Flag == true) {
            console.log(req.query);
            last_marble_vetting_result = JSON.parse(req.query.seq);
            console.log(last_marble_vetting_result);
            expected_winner_pebble = parseInt(req.query.query);
            console.log(expected_winner_pebble);
            res.json({ status: "success", msg: "expected_winner!" });
        }
        else {
            res.json({ status: "false", msg: "invalid!" });
        }
    }
    else {
        if (betting_hamster_Flag == true) {
            console.log(req.query);
            const temp = JSON.parse(req.query.seq);
            for (let i = 0; i < hamster_count; i++) {
                last_hamster_vetting_result[i] = temp[i];
            }
            console.log(temp);
            expected_winner_hamster = parseInt(req.query.query);
            console.log(last_hamster_vetting_result);
            res.json({ status: "success", msg: "expected_winner_decided!" });
        }
        else {
            res.json({ status: "false", msg: "invalid!" });
        }
    }
});

app.get("/api/expetwinner", (req, res) => {
    let bet_id = req.query.bet_id;
    if (bet_id === "bet") {
        res.json({ status: "success", msg: expected_winner_pebble });
    }
    else {
        res.json({ status: "success", msg: expected_winner_hamster });
    }
});

app.get("/api/bettingEnd", async (req, res) => {
    console.log("Betting End!!!");
    let bet_id = req.query.bet_id;
    // Call the backend function a()
    var winners = await bettingEnd(bet_id);
    // Send a response to the frontend
    res.json({ status: "success", winners });
});



app.get("/api/bettingStart", (req, res) => {
    console.log("Betting Start!!!");
    let bet_id = req.query.bet_id;
    console.log(bet_id);
    if (bet_id === "bet") {
        total_amount = 0;
        total_each_pebble = [0, 0, 0, 0, 0, 0, 0, 0];
        expected_winner_pebble = 1;
        betting_marble_Flag = true;
        console.log("betting_marble_Flag: ", betting_marble_Flag);
        var pool = mysql.createPool({
            connectionLimit: 100,
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'mydb',
            timezone: 'Z'
        });
        var sql = "DELETE FROM bettingInfo";
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            connection.on('error', function (err) {
                console.log('>>> error >>>', err);
            });

            connection.query(sql, (err, result) => {
                if (err) {
                    console.error('Error inserting data into MySQL:', err);
                    throw err;
                }
                console.log('Data inserted successfully:', result);
            });
        });
    }
    else {
        total_amount_hamster = 0;
        total_each_pebble_hamster = [0, 0, 0, 0];
        expected_winner_hamster = 1;
        betting_hamster_Flag = true;
        var pool = mysql.createPool({
            connectionLimit: 100,
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'mydb',
            timezone: 'Z'
        });
        var sql = "DELETE FROM bettingInfo1";
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            connection.on('error', function (err) {
                console.log('>>> error >>>', err);
            });

            connection.query(sql, (err, result) => {
                if (err) {
                    console.error('Error inserting data into MySQL:', err);
                    throw err;
                }
                console.log('Data inserted successfully:', result);
            });
        });
    }
    res.send("Betting Successfully Start!!!");
});

const IDL = {
    "version": "0.1.0",
    "name": "solana_betting_contract",
    "instructions": [
        {
            "name": "transferSol",
            "accounts": [
                {
                    "name": "from",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "to",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "amount",
                    "type": "u64"
                }
            ]
        }
    ],
    "accounts": [
        {
            "name": "userState",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "user",
                        "type": "publicKey"
                    },
                    {
                        "name": "amount",
                        "type": "u64"
                    },
                    {
                        "name": "pebble",
                        "type": "u8"
                    }
                ]
            }
        }
    ]
};

// start()

// Start the server
server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});