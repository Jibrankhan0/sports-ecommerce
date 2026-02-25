export default function StarRating({ rating = 0, size = 14 }) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <span key={i} style={{ color: i <= Math.round(rating) ? '#ffd740' : '#333355', fontSize: size }}>
                ★
            </span>
        );
    }
    return <div style={{ display: 'flex', gap: '2px' }}>{stars}</div>;
}
