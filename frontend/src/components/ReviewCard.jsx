import StarRating from './StarRating';

export default function ReviewCard({ review }) {
    const { name, rating, text, date } = review;
    return (
        <div className="review-card card animate-fade">
            <div className="review-top">
                <div className="reviewer-avatar">{name[0]}</div>
                <div>
                    <div className="reviewer-name">{name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{date}</div>
                </div>
            </div>
            <StarRating rating={rating} size={14} />
            <p className="review-text">"{text}"</p>
        </div>
    );
}
