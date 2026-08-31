import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { rideAPI, ratingAPI } from '../services/api';
import { formatDateTime } from '../utils/format';
import toast from 'react-hot-toast';

const RideComplete: React.FC = () => {
  const { rideId } = useParams<{ rideId: string }>();
  const navigate = useNavigate();
  const [ride, setRide] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alreadyRated, setAlreadyRated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (rideId) loadRide();
  }, [rideId]);

  const loadRide = async () => {
    try {
      const [rideRes, ratingsRes] = await Promise.all([
        rideAPI.getRide(rideId!),
        ratingAPI.getRideRatings(rideId!),
      ]);
      setRide(rideRes.data);
      const customerId = rideRes.data.customer_id;
      const myRating = ratingsRes.data.find((r: any) => r.from_user_id === customerId);
      setAlreadyRated(!!myRating);
    } catch {
      toast.error('Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async () => {
    if (!ride?.driver_user_id) return;
    setSubmitting(true);
    try {
      await ratingAPI.createRating({
        ride_id: rideId,
        to_user_id: ride.driver_user_id,
        rating,
        comment: comment || undefined,
      });
      toast.success('Thanks for your rating!');
      setAlreadyRated(true);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !ride) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const fare = ride.actual_fare ?? ride.estimated_fare;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-600 text-white p-6 text-center">
        <div className="text-5xl mb-2">✓</div>
        <h1 className="text-2xl font-bold">Ride Completed</h1>
        <p className="text-green-100 mt-1">Thank you for riding with us</p>
      </div>

      <div className="p-6 space-y-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div className="text-center border-b pb-4">
            <p className="text-sm text-gray-500">Total Fare</p>
            <p className="text-4xl font-bold text-primary">₹{Math.round(fare)}</p>
            <p className="text-sm text-gray-500 mt-1">Pay driver in cash</p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="bg-green-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">A</span>
              <div>
                <p className="text-xs text-gray-500">Pickup</p>
                <p className="font-medium">{ride.pickup_address}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">B</span>
              <div>
                <p className="text-xs text-gray-500">Dropoff</p>
                <p className="font-medium">{ride.dropoff_address}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500">Distance</p>
              <p className="font-semibold">{ride.distance_km?.toFixed(1)} km</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500">Completed</p>
              <p className="font-semibold">{formatDateTime(ride.completed_at)}</p>
            </div>
          </div>

          {ride.driver_name && (
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-500">Driver</p>
              <p className="font-semibold text-lg">{ride.driver_name}</p>
              {ride.driver_vehicle && (
                <p className="text-gray-600">Vehicle: {ride.driver_vehicle}</p>
              )}
            </div>
          )}
        </div>

        {!alreadyRated && ride.driver_user_id && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="font-bold text-lg mb-4">Rate your driver</h2>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional comment..."
              className="w-full border rounded-xl p-3 mb-4 text-sm"
              rows={2}
            />
            <button
              onClick={submitRating}
              disabled={submitting}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        )}

        {alreadyRated && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center font-medium">
            You rated this ride ★
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/rides')}
            className="flex-1 border-2 border-gray-300 py-3 rounded-xl font-semibold"
          >
            Ride History
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold"
          >
            Book Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default RideComplete;
