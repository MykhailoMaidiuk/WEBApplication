import React, { useEffect, useState } from "react";

const BookDetail = ({ isbn13, onBack }) => {
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookDetail = async () => {
      setIsLoading(true);
      try {
        // Upravená URL pro Nginx konfiguraci
        const url = `/api/books/${isbn13}`;
        console.log("Fetching book details from:", url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
        });

        console.log("Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched book data:", data);
          setBook(data);
        } else {
          const errorText = await response.text();
          console.error("Error response:", errorText);

          if (response.status === 404) {
            setError(`Book with ISBN ${isbn13} not found`);
          } else {
            setError(`Failed to load book details (Status: ${response.status})`);
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError(`Network error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (isbn13) {
      fetchBookDetail();
    } else {
      setError("No ISBN provided");
      setIsLoading(false);
    }
  }, [isbn13]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <button
          onClick={onBack}
          className="px-4 py-2 mb-4 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to List
        </button>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="px-4 py-2 mb-5 bg-gray-200 rounded hover:bg-gray-300 transition"
      >
        Back to List
      </button>

      <div className="space-y-6">
        {/* Title Section */}
        <div>
          <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
          {book.subtitle && (
            <h2 className="text-lg text-gray-600">{book.subtitle}</h2>
          )}
        </div>

        {/* Main Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Image if available */}
          {book.thumbnail && (
            <div>
              <img
                src={book.thumbnail}
                alt={book.title}
                className="w-full h-auto rounded shadow-lg"
              />
            </div>
          )}

          {/* Right Column - Book Details */}
          <div className="space-y-3">
            <DetailRow label="Author(s)" value={book.authors} />
            <DetailRow label="ISBN-13" value={book.isbn13} />
            <DetailRow label="ISBN-10" value={book.isbn10} />
            <DetailRow label="Published Year" value={book.published_year} />
            <DetailRow label="Categories" value={book.categories} />
            <DetailRow label="Number of Pages" value={book.num_pages} />
            <DetailRow
              label="Rating"
              value={`${book.average_rating} (${book.ratings_count} ratings)`}
            />
          </div>
        </div>

        {/* Description Section */}
        {book.description && (
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{book.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }) => {
  if (!value && value !== 0) return null;

  return (
    <div className="py-2 border-b border-gray-200">
      <span className="font-semibold">{label}:</span>{' '}
      <span className="text-gray-700">{value}</span>
    </div>
  );
};

export default BookDetail;