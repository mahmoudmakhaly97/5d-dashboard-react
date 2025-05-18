import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import logo from '/assets/images/5d-logo.png'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'

import { sygnet } from 'src/assets/brand/sygnet'

// sidebar nav config
import navigation, { useNavItems } from './_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const navItems = useNavItems()

  return (
    <CSidebar
      className="border-end"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <div className="d-flex align-items-center gap-2">
          <img src={logo} alt="logo" width="40" height="40" />
          <h6>5d Dashboard</h6>
        </div>
      </CSidebarHeader>
      <AppSidebarNav items={navItems} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
