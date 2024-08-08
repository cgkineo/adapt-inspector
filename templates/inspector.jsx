import React from 'react';
import { classes, compile } from 'core/js/reactHelpers';

export default function Inspector(props) {
  const {
    _tracUrl,
    onClick,
    _id,
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
    <div
      className='inspector-inner'
      aria-hidden='true'
      role={_tracUrl ? 'link' : null}
      tabIndex={_tracUrl ? 0 : null}
      onClick={_tracUrl ? onClick : null}
    >
      INSPECTOR! {_id}

      {_id &&
      <span
        className='inspector-id'
        dangerouslySetInnerHTML={{ __html: _id }}
      />
      }
    </div>
  );
}
