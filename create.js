window.arweave = Arweave.init();
window.arweave.network.getInfo().then(console.log);
console.log("VERSION = "+window.PUZZLE_VERSION)

window.wallet = undefined;

document.getElementById("keyfile").onchange = (ev) => {
    const fileReader = new FileReader();
    fileReader.onload = async (e) => {
        window.wallet = JSON.parse(e.target.result);

        arweave.wallets.jwkToAddress(window.wallet).then((addr) => {
            console.log(addr);
            arweave.wallets.getBalance(addr).then((bal) => {
                console.log(arweave.ar.winstonToAr(bal));
            });
        });
    }
    fileReader.readAsText(ev.target.files[0]);
}

var submitPuzzle = async () => {
    var title = $("#title_input").val().trim()
    if(title.length < 1 || title.length > 100) { alert("Please input a valid title (max 100 chars)"); return; }

    var reward = arweave.ar.arToWinston($("#reward_input").val().trim())
    if(reward < 10000000) { alert("Please input a valid reward (minimum 10,000,000 winston)"); return; }

    var details = $("#description_input").val().trim()
    if(details.length < 5) { alert("Please input a valid puzzle"); return; }

    var solution_temp = $("#solution_input").val().trim().toLowerCase()
    var solution = solution_temp.replace(/[^0-9a-z]/gi, '')
    if(solution.length < 1 || solution != solution_temp) { alert("Please input a valid solution"); return; }

    if(!window.wallet) { alert("Please upload a valid wallet"); return; }


    var senderAddress = await arweave.wallets.jwkToAddress(window.wallet);
    var senderBalance = parseInt(await arweave.wallets.getBalance(senderAddress));


    if (senderBalance < reward) {
        alert("You do not have enough AR to create a puzzle with the specified reward. "+senderBalance)
        return
    }

    var id = Math.floor(Math.random() * 100000000);

    document.write("Submitting puzzle. Do not close this page. Please wait...<br>");
    document.write("Generating reward...<br>");

    var rewardWallet = await arweave.wallets.generate()
    var rewardWalletAddress = await arweave.wallets.jwkToAddress(rewardWallet)

    document.write("Encrypting puzzle...<br>");

    var encryptionKey = generateEncryptionKey(id, solution);
    var encryptedKey = encryptPrivKey(rewardWallet, encryptionKey)

    var solutionHash = sha256(sha256(sha256(solution) + id))

    document.write("Creating puzzle transaction...<br>");

    var txn = await arweave.createTransaction({
        target: rewardWalletAddress,
        quantity: reward,
        data: btoa(details) + "||" + solutionHash + "||" + encryptedKey
    }, window.wallet);

    txn.addTag("PuzzleWeave", "PuzzleWeave");
    txn.addTag("Version", window.PUZZLE_VERSION.toString());

    txn.addTag("Timestamp", Math.round(new Date().getTime() / 1000).toString());
    txn.addTag("Id", id.toString());

    txn.addTag("Title", title);
    txn.addTag("Reward", reward.toString());

    document.write("Signing puzzle...<br>");

    await arweave.transactions.sign(txn, window.wallet);

    document.write("Sending puzzle to blockchain...<br>");

    var response = await arweave.transactions.post(txn);

    console.log(response)

    if (response.status == 200) {
        document.write("Puzzle submitted successfully. It should appear within 2-4 minutes on the <a href='index.html'>puzzles list</a>")
    } else {
        document.write(`Internal error (error code ${response.status}) <a href='index.html'>Click here to go back to the puzzles list</a>`)
    }
}


