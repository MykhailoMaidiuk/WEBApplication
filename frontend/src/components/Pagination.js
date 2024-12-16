function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - halfPagesToShow);
    let endPage = Math.min(totalPages, currentPage + halfPagesToShow);

    if (endPage - startPage + 1 < maxPagesToShow) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
      <div className="pagination">
          <br/><br/><br/>
          <button
              className="pagination__btn"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
          >
              &laquo; Previous
          </button>

          {getPageNumbers().map((page) => (
              <button
                  key={page}
                  className={`pagination__btn ${page === currentPage ? "active" : ""}`}
                  onClick={() => onPageChange(page)}
              >
                  {page}
              </button>
          ))}

          <button
              className="pagination__btn"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
          >
              Next &raquo;
          </button>
      </div>
  );
}

export default Pagination; // Default export