const contractText = `
;; title: $TOKEN_NAME token
;; version: 0.0.0
;; description: $DESCRIPTION

(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

(define-fungible-token $FT_NAME SUPPLY)

(define-constant MAX-MINT u$MAX_MINT)
(define-constant SUPPLY u$SUPPLY)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
    (begin
        (asserts! (is-eq tx-sender sender) (err u1001))
        (asserts! (>= (ft-get-balance $FT_NAME sender) amount) (err u1002))
        (asserts! (not (is-eq sender recipient)) (err u1003))
        (match memo to-print (print to-print) 0x)
        (ft-transfer? $FT_NAME amount sender recipient))
)

(define-public (burn (amount uint))
    (begin
        (asserts! (is-eq contract-caller tx-sender) (err u1004))
        (asserts!  (>= (ft-get-balance $FT_NAME tx-sender) amount) (err u1002))
        (ft-burn? $FT_NAME amount tx-sender)
    ))

(define-public (mint (amount uint))
    (begin
        (asserts! (is-eq contract-caller tx-sender) (err u1004))
        ;; if yer a kentrekt then ye kant ment
        (asserts! (is-none (get name (unwrap-panic (principal-destruct? tx-sender)))) (err u1005))
        (asserts! (<= (ft-get-supply $FT_NAME) SUPPLY) (err u1007))
        (asserts! (<= amount MAX-MINT) (err u1006))
        (ft-mint? $FT_NAME amount tx-sender)
    ))

(define-read-only (get-balance (address principal))
    (ok (ft-get-balance $FT_NAME address)))

(define-read-only (get-decimals)
    (ok u$TOKEN_DECIMALS))

(define-read-only (get-name)
    (ok "$TOKEN_NAME"))

(define-read-only (get-symbol)
    (ok "$TOKEN_SYMBOL"))

(define-read-only (get-token-uri)
    (ok (some u"ipfs://ipfs/$METADATA_IPFS_CID")))

(define-read-only (get-total-supply)
    (ok (ft-get-supply $FT_NAME)))
`

const variablesMap = {
  $TOKEN_NAME: /\$TOKEN_NAME/g,
  $DESCRIPTION: /\$DESCRIPTION/g,
  $FT_NAME: /\$FT_NAME/g,
  $TOKEN_SYMBOL: /\$TOKEN_SYMBOL/g,
  $TOKEN_DECIMALS: /\$TOKEN_DECIMALS/g,
  $SUPPLY: /\$SUPPLY/g,
  $MAX_MINT: /\$MAX_MINT/g,
  $METADATA_IPFS_CID: /\$METADATA_IPFS_CID/g,
}

export default function writeShitCoinContract({
  tokenName,
  supply,
  symbol,
  decimals,
  description,
  maxMintAmount,
  ft_name,
  metadataIpfsCID,
}: {
  ft_name: string
  tokenName: string
  supply: number
  symbol: string
  decimals: number
  description: string
  maxMintAmount: number
  metadataIpfsCID: string
}) {
  return contractText
    .replace(variablesMap.$TOKEN_NAME, tokenName)
    .replace(variablesMap.$DESCRIPTION, description)
    .replace(variablesMap.$FT_NAME, ft_name)
    .replace(variablesMap.$TOKEN_SYMBOL, symbol)
    .replace(variablesMap.$TOKEN_DECIMALS, String(decimals))
    .replace(variablesMap.$SUPPLY, String(supply))
    .replace(variablesMap.$MAX_MINT, String(maxMintAmount))
    .replace(variablesMap.$METADATA_IPFS_CID, String(metadataIpfsCID))
}
