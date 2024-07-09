import React from 'react';
import { classes, compile } from 'core/js/reactHelpers';

export default function Inspector(props) {
  const {
    _tracUrl,
    _parentId,
    _classes,
    _layout,
    title,
    _isOptional,
    _selectable,
    _children,
    _items,
    attributes
  } = props;
  return (
    <div className='inspector-inner'>
      INSPECTOR!<br />
      TRAC: {_tracUrl}
    </div>
  );
}
