/* eslint-disable prettier/prettier */
import React from 'react'
import ReactPaginate from 'react-paginate'
import './pagination.scss'
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageChange = (e) => {
    onPageChange(e.selected + 1)
  }

  return (
    <ReactPaginate
      previousLabel={'Previous'}
      nextLabel={'Next'}
      breakLabel={'...'}
      pageCount={totalPages}
      marginPagesDisplayed={0}
      pageRangeDisplayed={5}
      onPageChange={handlePageChange}
      containerClassName="pagination justify-content-center"
      pageClassName="page-item"
      pageLinkClassName="page-link"
      previousClassName="page-item"
      previousLinkClassName="page-link"
      nextClassName="page-item"
      nextLinkClassName="page-link"
      breakClassName="page-item"
      breakLinkClassName="page-link"
      activeClassName="active"
      forcePage={currentPage - 1}
    />
  )
}

export default Pagination
