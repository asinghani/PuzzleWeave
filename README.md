# PuzzleWeave

PuzzleWeave is a system for easily deploying puzzles, riddles, and cryptography challenges through the ArWeave network. Puzzles are stored on the ArWeave blockchain in a cryptographically-secure manner. Inspired by puzzles such as those on [/r/bitcoinpuzzles](https://reddit.com/r/bitcoinpuzzles/).

See the live demo: [https://arweave.net/B6IohL5YPrkj0ocSeSVSK0_g__e4wJxSK5uqjlM0Xd4](https://arweave.net/B6IohL5YPrkj0ocSeSVSK0_g__e4wJxSK5uqjlM0Xd4) 

# How it Works

1. The puzzle creator develops a puzzle and uploads it to PuzzleWeave. An "escrow" wallet is created and the reward coins (the quantity of which is chosen by the puzzle creator) are put into the escrow wallet. The escrow wallet's private key is then encrypted using the puzzle's solution as an encryption key. The puzzle description and the encrypted private key are then stored on the blockchain.

2. Once the transaction containing the puzzle has been mined, the puzzle will appear on the homepage of PuzzleWeave as an unsolved puzzle. Users can then choose a puzzle to attempt to solve.

3. The user solves the puzzle and enters their solution into the "solve" page. If the solution is correct, PuzzleWeave decrypts the private key and drains the escrow wallet, which marks the puzzle as solved and gives the reward to the solver. The puzzle is then shown as "solved" on the homepage. Other users may still attempt the puzzle and check if their solution is correct, but they will not be given the reward.

Note on fees: PuzzleWeave itself charges no fees. However, the ArWeave network has a small (0.25 AR at the time of writing) fee for creating new wallets, and a miniscule fee for sending transactions. These fees are transparently passed on to the user at the time of puzzle creation.

# Contributing

This application has been deployed onto the ArWeave blockchain. Feel free to make forks and improvements. In order to prevent conflicting blockchain data, please change the `window.PUZZLEWEAVE` parameter in `utils.js` to distinguish the data stored on the blockchain.
