import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4  ">
      <div>
        <a href="" rel="noopener noreferrer">
          5D Dashboard©
        </a>
      </div>
      <div className="ms-auto">
        <a href="" rel="noopener noreferrer">
          Crafted with by5D
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
