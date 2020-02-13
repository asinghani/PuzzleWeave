window.arweave = Arweave.init();
window.arweave.network.getInfo().then(console.log);

function generateTableRow(title, reward, timestamp, id) {
    return `<tr style="cursor: pointer;" onclick="window.location.href='solve.html?id=${id}';">
                <td><a href="solve.html?id=${id}">${title}</a></td>
                <td>${reward} AR</td>
                <td>${timestamp}</td>
            </tr>`;
}

var startFunc = async () => {
    var txids = await arweave.arql({op: "equals", expr1: "PuzzleWeave", expr2: window.PUZZLEWEAVE})
    var txns = await Promise.all(txids.map((id) => { return arweave.transactions.get(id); }))

    txns = txns.filter((txn) => { return parseInt(decodeTags(txn)["Version"]) >= window.EARLIEST_VERSION; })

    var puzzlesReady = await asyncFilter(txns, async (txn) => { return (await arweave.wallets.getBalance(txn.target)) > 100000 })

    var puzzlesCompleted = await asyncFilter(txns, async (txn) => { return (await arweave.wallets.getBalance(txn.target)) < 100000 })
 
    puzzlesReady = puzzlesReady.map((txn) => {
        var tags = decodeTags(txn)
        return [tags["Title"],
                parseFloat(arweave.ar.winstonToAr(parseInt(tags["Reward"]))).toFixed(3),
                formatDate(parseInt(tags["Timestamp"])),
                txn.id]
    })

    puzzlesCompleted = puzzlesCompleted.map((txn) => {
        var tags = decodeTags(txn)
        return [tags["Title"],
                parseFloat(arweave.ar.winstonToAr(parseInt(tags["Reward"]))).toFixed(3),
                formatDate(parseInt(tags["Timestamp"])),
                txn.id]
    })


    document.getElementById("open_body").innerHTML = (puzzlesReady.map((puzzle) => { return generateTableRow(...puzzle); })).join("")

    document.getElementById("completed_body").innerHTML = (puzzlesCompleted.map((puzzle) => { return generateTableRow(...puzzle); })).join("")
}

startFunc();

