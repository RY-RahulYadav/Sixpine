import React, { useEffect } from 'react';

interface ProductInfoProps {
  product: any;
  selectedVariant?: any;
  onVariantSelect?: (variant: any) => void;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ 
  product, 
  selectedVariant, 
  onVariantSelect 
}) => {
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      onVariantSelect?.(product.variants[0]);
    }
  }, [product]);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="bi bi-star-fill text-warning"></i>);
    }
    
    if (hasHalfStar) {
      stars.push(<i key="half" className="bi bi-star-half text-warning"></i>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="bi bi-star text-warning"></i>);
    }
    
    return stars;
  };

  const currentPrice = selectedVariant?.effective_price || product?.price || 0;
  const oldPrice = selectedVariant?.effective_old_price || product?.old_price;

  return (
    <>
      <h2 className="product-title">{product?.title}</h2>
      <div className="box_bx">
        <p className="text-muted">
          Brand: <span className="fw-bold">{product?.brand?.name || 'Unknown'}</span>
        </p>
        <p className="small d-flex align-items-center gap-2">
          {renderStars(product?.average_rating || 0)}
          <span className="text-muted">({product?.review_count || 0} Reviews)</span>
        </p>
      </div>

      <div className="price-section">
        <h4 className="text-danger">
          ₹{currentPrice.toLocaleString()}
        </h4>
        {oldPrice && oldPrice > currentPrice && (
          <p className="text-success">
            {product?.discount_percentage}% Off{' '}
            <span className="text-decoration-line-through text-muted">
              ₹{oldPrice.toLocaleString()}
            </span>
          </p>
        )}
      </div>

      <div className="availability-section mb-3">
        <p className={`fw-bold ${product?.stock_quantity > 0 ? 'text-success' : 'text-danger'}`}>
          {product?.availability === 'in_stock' && product?.stock_quantity > 0 
            ? `In Stock (${product.stock_quantity} available)`
            : 'Out of Stock'
          }
        </p>
      </div>

      <div className="offers">
        <h6>Available Offers</h6>
        <ul className="list-unstyled list_1">
          <li>
            <i className="bi bi-tag-fill text-success me-2"></i>Free delivery on orders above ₹499
          </li>
          <li>
            <i className="bi bi-tag-fill text-success me-2"></i>EMI available
          </li>
          {product?.is_on_sale && (
            <li>
              <i className="bi bi-tag-fill text-success me-2"></i>Special discount of {product?.discount_percentage}%
            </li>
          )}
        </ul>
      </div>

      <ul className="list-unstyled list_1">
        <li className="d-flex align-items-center">
          <span>
            <i className="bi bi-check-circle-fill text-success me-2"></i> Free Delivery
          </span>
        </li>
        <li className="d-flex align-items-center">
          <span>
            <i className="bi bi-check-circle-fill text-success me-2"></i> 7 Days Replacement
          </span>
        </li>
        <li className="d-flex align-items-center">
          <span>
            <i className="bi bi-check-circle-fill text-success me-2"></i> Secure Transaction
          </span>
        </li>
      </ul>

      {/* Product Variants Selection */}
      {product?.variants && product.variants.length > 0 && (
        <div className="box_b mb-4">
          <h6>Available Variants</h6>
          <div className="row">
            {product.variants.map((variant: any) => (
              <div key={variant.id} className="col-6 col-md-4 mb-2">
                <button
                  className={`btn btn-outline-primary btn-sm w-100 ${
                    selectedVariant?.id === variant.id ? 'active' : ''
                  }`}
                  onClick={() => onVariantSelect?.(variant)}
                >
                  {variant.name}
                  <br />
                  <small>₹{variant.effective_price.toLocaleString()}</small>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Attributes */}
      {product?.attributes && product.attributes.length > 0 && (
        <div className="box_b mb-4">
          <h6>Specifications</h6>
          <div className="specifications-list">
            {product.attributes.map((attr: any, index: number) => (
              <div key={index} className="d-flex justify-content-between py-1 border-bottom">
                <strong>{attr.filter_attribute.name}:</strong>
                <span>{attr.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="product_details_1">
        <div className="key-details">
          <h6>Key Details</h6>
          <div className="details-grid">
            <div className="detail-box">
              <strong>Brand:</strong> {product?.brand?.name || 'N/A'}
            </div>
            <div className="detail-box">
              <strong>SKU:</strong> {product?.sku || 'N/A'}
            </div>
            <div className="detail-box">
              <strong>Category:</strong> {product?.category?.name || 'N/A'}
            </div>
            {product?.weight && (
              <div className="detail-box">
                <strong>Weight:</strong> {product.weight} kg
              </div>
            )}
            {product?.dimensions && (
              <div className="detail-box">
                <strong>Dimensions:</strong> {product.dimensions}
              </div>
            )}
            <div className="detail-box">
              <strong>Availability:</strong> {product?.availability?.replace('_', ' ') || 'N/A'}
            </div>
          </div>
        </div>

        <div className="about-item">
          <h5>About This Item</h5>
          <div className="description-text">
            {product?.description || product?.short_description || 'No description available.'}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductInfo;
