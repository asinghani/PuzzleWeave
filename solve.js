window.arweave = Arweave.init();
window.arweave.network.getInfo().then(console.log);

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

var startFunc = async () => {
    window.txid = window.location.search.replace("?id=", "")
    var txn;
    try {
        txn = await arweave.transactions.get(window.txid)

        var tags = decodeTags(txn)

        if(parseInt(tags["Version"]) < window.EARLIEST_VERSION) {
            alert("Puzzle version too old.")
            window.location.href = "index.html"
            return
        }

        window.reward = parseInt(tags["Reward"])
        var reward = parseFloat(arweave.ar.winstonToAr(window.reward)).toFixed(3)
        var title = tags["Title"]
        window.id = tags["Id"]

        var data = txn.get("data", {decode: true, string: true}).split("||")
        var details = atob(data[0])
        window.solutionHash = data[1]
        window.rewardWallet = data[2]

        $("#puzzle_title").html(title)
        $("#puzzle_reward").html(reward)
        $("#puzzle_content").html(cleanHtml(details))

        $("#puzzle_content").html(cleanHtml(details))



    } catch (e) {
        alert("Failed to load puzzle. If it has been recently created, please try again in a few minutes. If you have copied this URL, please ensure it was not cut off.")

        window.location.href = "index.html"

        return
    }
}

startFunc();


var submitSolution = async () => {
    var solution_temp = $("#puzzle_solution").val().trim().toLowerCase()
    var solution = solution_temp.replace(/[^0-9a-z]/gi, '')
    console.log(solution)
    if(solution.length < 1 || solution != solution_temp) { alert("Please input a valid solution"); return; }

    if(!window.wallet) { alert("Please upload a valid wallet"); return; }

    var hash = sha256(sha256(sha256(solution) + window.id))
    console.log(hash)
    console.log(window.solutionHash)

    var privKey, balance

    if(hash == window.solutionHash) {
        try {
            var decryptionKey = generateEncryptionKey(window.id, solution);
            privKey = decryptPrivKey(window.rewardWallet, decryptionKey)

            balance = parseInt(await arweave.wallets.getBalance(await arweave.wallets.jwkToAddress(privKey)))

            if(balance < 100000) {
                alert("Puzzle has already been solved. Please try a different puzzle")
                return
            }

        } catch(e) {
            alert("Incorrect solution.")
            console.log(e)
            return
        }

        document.write("Correct solution! Claiming reward now. Please do not close this page <br>")

        var userAddress = await arweave.wallets.jwkToAddress(window.wallet)
        console.log(userAddress)

        document.write("Creating transaction...<br>");

        console.log(balance)

        // Hack to drain entire wallet without knowing exact reward
        var tx = {quantity: 0, reward: 3000000}

        while ((balance - parseInt(tx.quantity) - parseInt(tx.reward)) > 5000 || (balance - parseInt(tx.quantity) - parseInt(tx.reward)) < 0) {
            tx = await arweave.createTransaction({
                target: userAddress,
                quantity: balance - tx.reward - 100,
            }, privKey);
        }

        console.log(privKey)


        document.write("Signing transaction...<br>");

        await arweave.transactions.sign(tx, privKey);

        console.log(JSON.stringify(tx))

        document.write("Sending transaction...<br>");

        var response = await arweave.transactions.post(tx);

        console.log(response)

        if (response.status == 200) {
            document.write("Reward claimed successfully. It should appear in your wallet within a few minutes <a href='index.html'>Try another puzzle!</a>")
        } else {
            document.write(`Internal error (error code ${response.status}). <a href='index.html'>Please try again later</a>`)
        }

    } else {
        alert("Incorrect solution")
        return
    }
}













