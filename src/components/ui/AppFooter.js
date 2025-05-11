import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4  ">
      <div>
        <a href="https://coreui.io" target="_blank" rel="noopener noreferrer">
          5D Dashboard©
        </a>
      </div>
      <div className="ms-auto">
        <a href="https://coreui.io/react" target="_blank" rel="noopener noreferrer">
          Crafted with by5D
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
