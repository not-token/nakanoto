import * as fs from "node:fs";

interface Transaction {
  sender: string | null;
  recipient: string;
  amount: number;
  block_height: number;
}

function calculateBalances(transactions: Transaction[]): Map<string, number> {
  let balances = new Map<string, number>();

  for (let transaction of transactions) {
    if (transaction.sender && !balances.has(transaction.sender)) {
      balances.set(transaction.sender, 0);
    }

    if (!balances.has(transaction.recipient)) {
      balances.set(transaction.recipient, 0);
    }
    if (transaction.sender) {
      let senderBalance = balances.get(transaction.sender)!;
      balances.set(transaction.sender, senderBalance - transaction.amount);
    }
    let recipientBalance = balances.get(transaction.recipient)!;

    balances.set(transaction.recipient, recipientBalance + transaction.amount);
  }

  return balances;
}

function processCSV(csvData: string): Map<string, number> {
  let lines = csvData.split("\n");
  let transactions: Transaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    // skip header line
    let fields = lines[i].split(",");

    if (fields.length !== 4) continue; // skip invalid lines

    transactions.push({
      sender: fields[0].includes("NULL") ? null : fields[0],
      recipient: fields[1],
      amount: Number(JSON.parse(fields[2])),
      block_height: Number(fields[3].trim()),
    });
  }

  return calculateBalances(transactions);
}

try {
  let data = fs.readFileSync("./data/wnv6.csv", "utf8");

  const balances = processCSV(data);

  let total = 0;
  let outputData = "";
  const sortedBalances = Array.from(balances.entries()).sort(
    ([, balanceA], [, balanceB]) => balanceB - balanceA,
  );
  for (let [address, balance] of sortedBalances) {
    if (address !== "NULL" && balance && !address.includes(".")) {
      outputData += `(trans '${JSON.parse(address)} u${balance})\n`;
      total += balance;
    }
  }

  console.log("total is", total.toLocaleString());

  fs.writeFileSync("./data/wnv6.txt", outputData);

  console.log("Balances written to 'wnv6.txt'");
} catch (err) {
  console.error(err);
}
