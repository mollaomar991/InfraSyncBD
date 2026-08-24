interface ListGroupProps {
  items: string[];
  heading: string;
  selectedItem: string;
  onSelectItem: (item: string) => void;
}

function ListGroup({
  items,
  heading,
  selectedItem,
  onSelectItem,
}: ListGroupProps) {
  return (
    <>
      <h3 className="list-group-heading">{heading}</h3>

      {items.length === 0 && (
        <p className="list-group-empty">No item found.</p>
      )}

      <ul className="list-group road-list-group">
        {items.map((item) => (
          <li
            key={item}
            className={`list-group-item ${
              item === selectedItem ? 'active' : ''
            }`}
            onClick={() => onSelectItem(item)}
          >
            <span>{item}</span>
            <small>›</small>
          </li>
        ))}
      </ul>
    </>
  );
}

export default ListGroup;
