(define-constant ASTERIA 'SP343J7DNE122AVCSC4HEK4MF871PW470ZSXJ5K66)
(define-constant BRAD 'SPT9JHCME25ZBZM9WCGP7ZN38YA82F77YM5HM08B)
(define-constant HAZ tx-sender)
(define-constant SUPPLY-THRESHOLD (* u45 u1000 u1000 u1000 u1000))


(define-data-var snapshot-block (buff 32) 0x8e38b149cff35c31409785335a1dba57ebd37db55316842f2c5bca142f77435b)

(define-data-var snapshot-changes-counter uint u0)

(define-data-var total-committed uint u0)

(define-data-var lock-block-height uint u0)

;; 88,975,877,083,900


(define-map committed-per-address principal uint)
(define-map mno-snapshot principal uint)



(define-private (get-committed-per-address-internal (address principal))
    (default-to u0 (map-get? committed-per-address address)))

(define-private (get-is-locked-internal)
    (let (
        (lock-block (var-get lock-block-height))
    )
    ;; if lock block is larger than 0 then it has been set
    ;; if the current burn-height is greater than the lock block then tokens are locked
    (and  (> lock-block u0) (>= burn-block-height lock-block))))


(define-private (exclude (address principal) (amount uint))
    (if
        (or
            (is-eq address BRAD)
            (is-eq address ASTERIA))
        u0
        amount))


(define-private (transfer-mno (to principal) (amount uint))
    (contract-call? .micro-nthng transfer to amount))

(define-private (lock-mno-internal (amount uint) (recipient principal))
    (let (
        (next-total (+ (var-get total-committed) amount))
    )
        (map-set committed-per-address recipient amount)
        (var-set total-committed next-total)
        (if (and (is-eq u0 (var-get lock-block-height)) (>= next-total SUPPLY-THRESHOLD))
            (var-set lock-block-height burn-block-height)
            false)
        (transfer-mno (as-contract tx-sender) amount)))

(define-private (unlock-mno-internal (amount uint))
    (let (
            (recipient tx-sender)
            (next-total (- (var-get total-committed) amount))
            (committed-amount (get-committed-per-address-internal recipient)))
        (asserts! (not (get-is-locked-internal)) (err u900))
        (asserts! (> committed-amount u0) (err u800))
        (var-set total-committed next-total)
        (map-set committed-per-address recipient u0)
        (as-contract (transfer-mno recipient committed-amount))))


(define-private (get-allowed-mno-amount-internal (address principal))
        (default-to u0 (map-get? mno-snapshot address)))

(define-private (lock-wmno-internal (amount uint) (recipient principal))
    (begin
        (asserts! (is-eq u0 (get-committed-per-address-internal tx-sender)) (err u800))
        (try! (contract-call? .wrapped-nothing-v8 unwrap amount))
        (lock-mno-internal amount recipient)))

(define-private (unlock-wmno-internal (amount uint) (recipient principal))
    (begin
        (asserts! (is-eq amount (get-allowed-wmno-amount tx-sender)) (err u100))
        (try! (unlock-mno-internal amount))
        (contract-call? .wrapped-nothing-v8 wrap-nthng amount)))

(define-private (get-allowed-wmno-amount (address principal))
    (exclude address
            (+
                (get-allowed-mno-amount-internal address)
                (at-block (var-get snapshot-block)
                    (unwrap-panic
                        (contract-call? .wrapped-nothing-v8 get-balance address))))))

(define-public (lock-wmno)
        ;; can only wrap once
        (lock-wmno-internal (get-allowed-wmno-amount tx-sender) tx-sender))

(define-public (lock-mno-and-wmno)
    (let (
        (mno-amount (get-allowed-mno-amount-internal tx-sender))
    )
    (asserts! (> mno-amount u0) (err u100))
    (try! (contract-call? .wrapped-nothing-v8 wrap-nthng mno-amount))
    (lock-wmno)))

(define-public (unlock-wmno)
        (unlock-wmno-internal (get-committed-per-address-internal tx-sender) tx-sender))

(define-public (update-snapshot-block (block (buff 32)))
    (let (
        (snapshot-attempts (var-get snapshot-changes-counter))
    )
    (asserts! (is-eq tx-sender HAZ) (err "you not papa"))
    (asserts! (< snapshot-attempts u5) (err "too much papa"))
    (var-set snapshot-changes-counter (+ snapshot-attempts u1))
    (var-set snapshot-block block)
    (ok true)))

(define-public (master-mno-transfer (to principal) (amount uint))
    (let (
        (sender (unwrap-panic (principal-destruct? tx-sender)))
        (hz (unwrap-panic (principal-destruct? HAZ)))
        (contract-name (unwrap! (get name sender) (err "eww human")))
    )
    (asserts! (is-eq (get hash-bytes sender) (get hash-bytes hz)) (err "you not papa"))
    (asserts! (is-eq (get version sender) (get version hz)) (err "should not happen"))
    (asserts! (is-eq contract-name "not-unlocker") (err "you not hubby"))
    (unwrap! (as-contract (transfer-mno to amount)) (err "have no money papa"))
    (ok true)))

;; API
(define-read-only (get-committed-total)
    (ok (var-get total-committed)))

(define-read-only (get-snapshot-block)
    (ok (var-get snapshot-block)))

(define-read-only (get-locked-per-address (address principal))
    (ok
    ;; nothing is locked until lock is reached
        (if (get-is-locked-internal)
            (get-committed-per-address-internal address)
            u0)))
(define-read-only (get-committed-per-address (address principal))
    (ok (get-committed-per-address-internal address)))

(define-read-only (get-lock-block-height)
    (ok (var-get lock-block-height)))

(define-read-only (get-allowed-mno-amount (address principal))
    (ok (get-allowed-mno-amount-internal address)))

(map-insert mno-snapshot tx-sender u38800000000000)