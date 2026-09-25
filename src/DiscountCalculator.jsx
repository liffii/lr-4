import { useState } from "react";
import "./DiscountCalculator.css";

const CATEGORIES = [
  { id: "electronics", label: "Электроника", discount: 5 },
  { id: "clothing", label: "Одежда", discount: 15 },
  { id: "groceries", label: "Продукты", discount: 10 },
  { id: "books", label: "Книги", discount: 20 },
  { id: "other", label: "Другое", discount: 0 },
];

const VAT_RATE = 0.22;

function DiscountCalculator() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "",
      price: "",
      category: "electronics",
    },
  ]);

  const [promoCode, setPromoCode] = useState("");
  const [customDiscount, setCustomDiscount] = useState(0);
  const [useCustomDiscount, setUseCustomDiscount] = useState(false);
  const [includeVat, setIncludeVat] = useState(true);
  const [calculated, setCalculated] = useState(false);
  const [errors, setErrors] = useState({});
  const [history, setHistory] = useState([]);

  function handleProductChange(id, field, value) {
    setProducts((currentProducts) =>
      currentProducts.map((product) => {
        if (product.id !== id) {
          return product;
        }

        if (field === "price") {
          if (value === "" || /^\d*\.?\d*$/.test(value)) {
            return {
              ...product,
              price: value,
            };
          }

          return product;
        }

        return {
          ...product,
          [field]: value,
        };
      })
    );

    setCalculated(false);
    setErrors({});
  }

  function addProduct() {
    setProducts((currentProducts) => [
      ...currentProducts,
      {
        id: Date.now(),
        name: "",
        price: "",
        category: "electronics",
      },
    ]);

    setCalculated(false);
  }

  function removeProduct(id) {
    if (products.length === 1) {
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== id)
    );

    setCalculated(false);
  }

  function getProductCalculation(product) {
    const numPrice = parseFloat(product.price) || 0;

    const selectedCategory = CATEGORIES.find(
      (category) => category.id === product.category
    );

    const categoryDiscount = selectedCategory
      ? selectedCategory.discount
      : 0;

    const discountPercent = useCustomDiscount
      ? Number(customDiscount)
      : categoryDiscount;

    const discountAmount = numPrice * (discountPercent / 100);
    const priceAfterDiscount = numPrice - discountAmount;

    const promoDiscount =
      promoCode.trim().toUpperCase() === "WELCOME10"
        ? priceAfterDiscount * 0.1
        : 0;

    const priceAfterPromo = priceAfterDiscount - promoDiscount;

    const vatAmount = includeVat ? priceAfterPromo * VAT_RATE : 0;
    const total = priceAfterPromo + vatAmount;

    return {
      numPrice,
      selectedCategory,
      discountPercent,
      discountAmount,
      priceAfterDiscount,
      promoDiscount,
      priceAfterPromo,
      vatAmount,
      total,
    };
  }

  function calculateTotal() {
    return products.reduce(
      (result, product) => {
        const calculation = getProductCalculation(product);

        return {
          price: result.price + calculation.numPrice,
          discount: result.discount + calculation.discountAmount,
          promo: result.promo + calculation.promoDiscount,
          vat: result.vat + calculation.vatAmount,
          total: result.total + calculation.total,
        };
      },
      {
        price: 0,
        discount: 0,
        promo: 0,
        vat: 0,
        total: 0,
      }
    );
  }

  function handleCalculate() {
    const newErrors = {};

    products.forEach((product, index) => {
      const numPrice = parseFloat(product.price);

      if (!product.price.trim()) {
        newErrors[index] = "Введите цену товара";
      } else if (isNaN(numPrice) || numPrice <= 0) {
        newErrors[index] = "Цена должна быть положительным числом";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setCalculated(false);
      return;
    }

    setErrors({});
    setCalculated(true);

    const calculation = calculateTotal();

    setHistory((currentHistory) => [
      {
        id: Date.now(),
        date: new Date().toLocaleString("ru-RU"),
        total: calculation.total,
        products: products.length,
      },
      ...currentHistory,
    ].slice(0, 5));
  }

  function handleReset() {
    setProducts([
      {
        id: 1,
        name: "",
        price: "",
        category: "electronics",
      },
    ]);

    setPromoCode("");
    setCustomDiscount(0);
    setUseCustomDiscount(false);
    setIncludeVat(true);
    setCalculated(false);
    setErrors({});
  }

  function formatRub(value) {
    return value.toLocaleString("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const totals = calculateTotal();

  return (
    <div className="calculator-wrapper">
      <h2 className="calculator-title">Калькулятор скидок</h2>

      {products.map((product, index) => (
        <div className="product-card" key={product.id}>
          <div className="product-card__header">
            <h3>Товар {index + 1}</h3>

            {products.length > 1 && (
              <button
                type="button"
                className="remove-button"
                onClick={() => removeProduct(product.id)}
              >
                Удалить
              </button>
            )}
          </div>

          <div className="field">
            <label htmlFor={`name-${product.id}`} className="field__label">
              Название товара
            </label>

            <input
              id={`name-${product.id}`}
              type="text"
              className="field__input"
              value={product.name}
              onChange={(e) =>
                handleProductChange(product.id, "name", e.target.value)
              }
              placeholder="Например: Смартфон"
            />
          </div>

          <div className="field">
            <label htmlFor={`price-${product.id}`} className="field__label">
              Цена товара (₽)
            </label>

            <input
              id={`price-${product.id}`}
              type="text"
              className={`field__input ${
                errors[index] ? "field__input--error" : ""
              }`}
              value={product.price}
              onChange={(e) =>
                handleProductChange(product.id, "price", e.target.value)
              }
              placeholder="Например: 1000"
              inputMode="decimal"
            />

            {errors[index] && (
              <span className="field__error">{errors[index]}</span>
            )}
          </div>

          <div className="field">
            <label
              htmlFor={`category-${product.id}`}
              className="field__label"
            >
              Категория товара
            </label>

            <select
              id={`category-${product.id}`}
              className="field__input field__select"
              value={product.category}
              onChange={(e) =>
                handleProductChange(product.id, "category", e.target.value)
              }
            >
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label} — скидка {category.discount}%
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="add-product-button"
        onClick={addProduct}
      >
        + Добавить товар
      </button>

      <div className="settings">
        <h3 className="settings__title">Дополнительные настройки</h3>

        <div className="field">
          <label htmlFor="promo" className="field__label">
            Промокод
          </label>

          <input
            id="promo"
            type="text"
            className="field__input"
            value={promoCode}
            onChange={(e) => {
              setPromoCode(e.target.value);
              setCalculated(false);
            }}
            placeholder="WELCOME10"
          />

          {promoCode.trim().toUpperCase() === "WELCOME10" && (
            <span className="field__success">
              Промокод применён: дополнительная скидка 10%
            </span>
          )}
        </div>

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={useCustomDiscount}
            onChange={(e) => {
              setUseCustomDiscount(e.target.checked);
              setCalculated(false);
            }}
          />
          <span>Использовать кастомную скидку</span>
        </label>

        {useCustomDiscount && (
          <div className="field">
            <label htmlFor="customDiscount" className="field__label">
              Ручная скидка: {customDiscount}%
            </label>

            <input
              id="customDiscount"
              type="range"
              min="0"
              max="50"
              value={customDiscount}
              onChange={(e) => {
                setCustomDiscount(e.target.value);
                setCalculated(false);
              }}
              className="range-input"
            />
          </div>
        )}

        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={includeVat}
            onChange={(e) => {
              setIncludeVat(e.target.checked);
              setCalculated(false);
            }}
          />
          <span>Учитывать НДС 22%</span>
        </label>
      </div>

      <div className="actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleCalculate}
        >
          Рассчитать
        </button>

        <button
          type="button"
          className="btn btn--secondary"
          onClick={handleReset}
        >
          Сбросить
        </button>
      </div>

      {calculated && !Object.keys(errors).length && (
        <div className="results">
          <h3 className="results__title">Результат расчёта</h3>

          {products.map((product, index) => {
            const calculation = getProductCalculation(product);

            return (
              <div className="product-result" key={product.id}>
                <h4>
                  {product.name.trim() || `Товар ${index + 1}`}
                </h4>

                <table className="results__table">
                  <tbody>
                    <tr>
                      <td>Исходная цена</td>
                      <td className="results__value">
                        {formatRub(calculation.numPrice)} ₽
                      </td>
                    </tr>

                    <tr>
                      <td>
                        Скидка ({calculation.discountPercent}%)
                      </td>
                      <td className="results__value results__value--discount">
                        −{formatRub(calculation.discountAmount)} ₽
                      </td>
                    </tr>

                    {calculation.promoDiscount > 0 && (
                      <tr>
                        <td>Промокод WELCOME10 (10%)</td>
                        <td className="results__value results__value--discount">
                          −{formatRub(calculation.promoDiscount)} ₽
                        </td>
                      </tr>
                    )}

                    <tr>
                      <td>Цена после скидок</td>
                      <td className="results__value">
                        {formatRub(calculation.priceAfterPromo)} ₽
                      </td>
                    </tr>

                    {includeVat && (
                      <tr>
                        <td>НДС (22%)</td>
                        <td className="results__value">
                          +{formatRub(calculation.vatAmount)} ₽
                        </td>
                      </tr>
                    )}

                    <tr className="results__row--total">
                      <td>Итого</td>
                      <td className="results__value">
                        {formatRub(calculation.total)} ₽
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}

          <div className="total-result">
            <span>Общая сумма к оплате</span>
            <strong>{formatRub(totals.total)} ₽</strong>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="history">
          <h3 className="results__title">История расчётов</h3>

          {history.map((item) => (
            <div className="history-item" key={item.id}>
              <span>{item.date}</span>
              <span>
                {item.products} товар(а) — {formatRub(item.total)} ₽
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DiscountCalculator;