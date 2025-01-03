/** @odoo-module **/

import { rpc } from "@web/core/network/rpc";
import publicWidget from "@web/legacy/js/public/public_widget";
import VariantMixin from "@website_sale/js/sale_variant_mixin";
const addMore = publicWidget.Widget.extend(VariantMixin, {
    selector: "#sm_new_request_form",

  events: {
    "click #addMore": "_onClickAddMore", // Event binding for Add More button
    "change #productSelect": "_onProductChange",
    "input #productSelect": "_onProductSearch",
    "click #submit": "_onClickSubmit",
    "click #save": "_onClickSave",
    "click #retrieve": "_retrieveDataFromSession",
    "click #addProduct": "_onClickAddProduct",
    "click #remove-row": "_onClickRemove",
  },
  data: [],
  init() {
    this._super(...arguments);
    this.notification = this.bindService("notification");
    // this.rpc = this.bindService("rpc");
    this.data = [];
  },

    async start() {
        await this._super.apply(this, arguments);
        this._renderContent();
    },

    async _renderContent() {
        try {
            const res = await rpc("/api/products");
            this.data = res.data;
        } catch (error) {
            console.log("Error rendering content", error);
        }
    },

    async _onClickSave(ev) {
        ev.preventDefault()
        console.log("Save button clicked")
        const rfqID = this.el.querySelector(".rfq_data_sv") ? this.el.querySelector(".rfq_data_sv").value : null;
        const formData = {
            partner_id: this.el.querySelector("#partner_id").value,
            request_date: this.el.querySelector("#request_date").value,
            data_order: this.el.querySelector("#data_order").value,
            date_planned: this.el.querySelector("#date_planned").value,
            products: [],
            ...(rfqID && { request_id: rfqID }),
        }
        console.log("Form data:\t",formData, "\t and id:\t", rfqID)
        const tableRows = Array.from(this.el.querySelectorAll("#productTableBody tr"))
            .filter((row) => row.querySelector(".product"));
        console.log(tableRows)
        let qty_error=false;
        if (tableRows.length === 0) {
            formData.products = [];
        } else {
            // Iterate over the rows if there are any
            tableRows.forEach((row) => {
                const productID = row.querySelector(".product").value || "";
                const productQty = row.querySelector(".product-qty").value || "";
                const productPackage = row.querySelector(".product-package").value || "";
                const productUnit = row.querySelector(".product-unit").value || "";

                // If productID is empty, exit
                if (productID === "") {
                    return;
                }
                if (productQty <= 0){
                    qty_error = true
                    return;
                }
                const selectedProduct = this.data.find(
                    (product) => product.product_id == Number(productID)
                );

            formData.products.push({
                product_name: selectedProduct ? selectedProduct.product_name : "",
                product_id: productID,
                product_qty: productQty,
                product_pkg: productPackage,
                product_uom: productUnit,
            });
        });
        if (qty_error){
            this.notification.add("Quantity should be greater than 0.", { type: 'warning' });
            return;
        }
    }
    try {
        const response = await rpc("/api/save_rfq_data", {
            method: "POST",
            body: JSON.stringify(formData),
            headers: { "Content-Type": "application/json" },
        });
        console.log(response)
        if (response.success) {
            this.notification.add("Data saved successfully!", {
                type: 'success'
            });
        } else {
            this.notification.add("Failed to save data. Please try again.", { type: "danger" });
        }
    } catch (error) {
        console.error("Error submitting RFQ", error);
        this.notification.add("An error occurred while submitting the request.", { type: "danger" });
    }
  },

    async _retrieveDataFromSession() {
        try {
            const response = await rpc("/api/get_rfq_data", { method: "GET" });

            if (response.success && response.data) {
                const data = response.data;
                console.log("Data retrieved:\t", data);
                this.el.querySelector("#partner_id").value = data.partner_id || "";
                this.el.querySelector("#request_date").value = data.request_date || "";
                this.el.querySelector("#data_order").value = data.data_order || "";
                this.el.querySelector("#date_planned").value = data.date_planned || "";

                const tableBody = this.el.querySelector("#productTableBody");
                tableBody.innerHTML = ""; // Clear existing rows

                const products = (data.products || []).filter(
                    product =>
                    product.product_id &&
                    product.product_uom
                );

                if (products.length === 0) {
                    // Display empty state
                    tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center">
                            No products found in the RFQ. Please add products to proceed.
                            <button type="button" id="addProduct" class="btn btn-primary mt-2">Add Product</button>
                        </td>
                    </tr>`;
                return;
            }
  
            // Render product rows
            products.forEach((product,index) => {
                const isFirstRow = index === 0
                const productRowHTML = this._createProductRow(product,isFirstRow);
                tableBody.insertAdjacentHTML("beforeend", productRowHTML);
            });
  

                this.notification.add("Data retrieved successfully!", { type: 'success' });
            } else {
                this.notification.add("No saved data found.", { type: 'danger' });
            }
        } catch (error) {
            this.notification.add("Error retriving data", { type: 'danger' });
        }
    },

_createProductRow(product={}, isFirstRow=false) {
    console.log("This data:\t",this.data)
    const productOptions = this.data.map(p => 
        `<option value="${p.product_id}" ${p.product_id === Number(product.product_id) ? 'selected' : ''}>
            ${p.product_name}
        </option>`
        ).join("");
        console.log("Product Options:\t", productOptions)
        const packageOptions = (this.data.find(p => p.product_id === Number(product.product_id)) ? .package || []).map(pkg =>
            `<option value="${pkg}" ${pkg === product.product_pkg ? 'selected' : ''}>
            ${pkg}
        </option>`
        ).join("");
        console.log("Product pkg options: \t", packageOptions)
        return `
        <tr>
            <td>
                <select id="productSelect" name="product" class="product">
                    <option value="">Select a product</option>
                    ${productOptions}
                </select>
            </td>
            <td>
                <input type="number" name="product-qty[]" class="product-qty" value="${product.product_qty || ''}" 
                       placeholder="Enter a product quantity"/>
            </td>
            <td>
                <select name="product-package" class="product-package"">
                    <option value="">Select a package</option>
                    ${packageOptions}
                </select>
            </td>
            <td>
                <input type="text" name="product-unit" class="product-unit" readonly 
                       value="${product.product_uom || 'Select a product first'}" 
                       />
            </td>
            <td>
                ${
                    isFirstRow
                        ? `<button type="button" id="addMore" class="btn btn-primary" 
                            style="font-size: 16px; padding: 7px 3px; width: 90px;">
                            Add More
                        </button>`
                        : ""
                }
                <button type="button" id="remove-row" class="btn btn-danger "  
                                                      style="font-size: 16px; padding: 7px 3px; width: 90px;">
                                                      Remove
                                                      </button>
            </td>
        </tr>`;
  },
  
  // _addEventListeners handler handles the remove button logic
  _addEventListeners() {
    const tableBody = this.el.querySelector("#productTableBody");
  
    tableBody.querySelectorAll(".remove-row").forEach(button => {
        button.addEventListener("click", event => {
            const row = event.target.closest("tr");
            row.remove();
        });
    });
  },

  async _onClickRemove(ev) {
    const row = ev.target.closest("tr");
    row.remove();
    const tableBody = this.el.querySelector("#productTableBody");
    const rows = tableBody.querySelectorAll("tr");
    const remainingRows = tableBody.querySelectorAll("tr").length;
            if (remainingRows === 0) {
                tableBody.innerHTML = `
                    <tr class="no-products-row">
                        <td colspan="5" class="text-center">
                            No products found in the RFQ. Please add products to proceed.
                            <button type="button" id="addProduct" class="btn btn-primary mt-2">Add Product</button>
                        </td>
                    </tr>
                `
            }
            else{
                const topRow = rows[0];
                const topRowActionCell = topRow.querySelector("td:last-child");
                const hasAddMoreButton = topRowActionCell.querySelector("#addMore");

                if (!hasAddMoreButton) {
                    const addMoreButtonHTML = `
                        <button type="button" id="addMore" class="btn btn-primary" 
                                style="font-size: 16px; padding: 7px 3px; width: 90px;">
                            Add More
                        </button>`;
                    topRowActionCell.insertAdjacentHTML("afterbegin", addMoreButtonHTML);
                }
            }
  },

    _onProductChange(ev) {
        const select = ev.currentTarget; // The select element
        // console.log(select,'product selected ....')
        const selectedProductId = select.value;
        // console.log(selectedProductId,'this is selected ')
        console.log(this.data, "this is change data");

        const selectedProduct = this.data.find(
            (product) => product.product_id == selectedProductId
        );
        // console.log(selectedProduct,'whene......')

        if (selectedProduct) {
            const row = select.closest("tr");
            const packageInput = row.querySelector(".product-package");
            const unitInput = row.querySelector(".product-unit");
            const packageOptions = selectedProduct.package || [];
            packageInput.innerHTML = '<option value="" disabled selected>Select a package</option>';
            packageOptions.forEach(pkg => {
                const option = document.createElement("option");
                option.value = pkg; // Set the value
                option.textContent = pkg; // Set the display text
                packageInput.appendChild(option);
            });
            unitInput.value = selectedProduct.unit || ""; // Set unit
        }
    },

    _onProductSearch() {},

    async _onClickSubmit(ev) {
        ev.preventDefault();

    const formData = {
      partner_id: this.el.querySelector("#partner_id").value,
      request_date: this.el.querySelector("#request_date").value,
      data_order: this.el.querySelector("#data_order").value,
      date_planned: this.el.querySelector("#date_planned").value,
      products: [],
    };
    if (formData.data_order === ""){
        this.notification.add("Please select an order date.", { type: 'warning' });
        return
    }
    if (formData.date_planned === ""){
        this.notification.add("Please select an expected arrival date.", { type: 'warning' });
        return
    }
    let hasError = false; // Flag to track validation errors
    let qtyError = false;
    const tableRows = this.el.querySelectorAll("#productTableBody tr");
    tableRows.forEach((row) => {
      console.log("row = \t",row)
      const productName = row.querySelector(".product").value;
      console.log("product name:\t",productName)
      const productQty = row.querySelector(".product-qty").value;
      const productPackage = row.querySelector(".product-package").value;
      const productUnit = row.querySelector(".product-unit").value;

            if (productName === "") {
                hasError = true
                return
            } else {
                hasError = false
            }
            if (productQty <= 0){
                qtyError = true
                return;
            }

      formData.products.push({
        product_id: productName,
        product_qty: productQty,
        product_pkg: productPackage,
        product_uom: productUnit,
      });
    });
    if (hasError){
        this.notification.add("Please select a product", { type: 'warning' });
        return
    }
    if (qtyError){
        this.notification.add("Quantity should be greater than 0", { type: 'warning' });
        return;
    }
    console.log(formData)
    try {
      const response = await rpc("/api/create_rfq", {
        method: "POST",
        body: JSON.stringify(formData), // Make sure to stringify the formData
        headers: { "Content-Type": "application/json" } // Set the correct content type
      });
      console.log(response)
      if (response.success) {
        this.notification.add(
            "Request for Quotation submitted successfully!", { type: 'success' }
        );
      } else {
        this.notification.add("Failed to submit the request. Please try again!", { type: 'danger' });
    }
    } catch (error) {
        this.notification.add("An error occurred while submitting the request.", error, { type: 'warning' });
    }
  },

  async _onClickAddProduct(ev){
    ev.preventDefault();
    const tableBody = this.el.querySelector("#productTableBody");
    const productRow = this._createProductRow({},true)
    tableBody.innerHTML = productRow;
  },

    _onClickAddMore(ev) {
        ev.preventDefault();

    const productSelect = this.el.querySelector(".product");
    const tableBody = this.el.querySelector("#productTableBody");
    const productQtyInput = this.el.querySelector(".product-qty");
    const productPackageSelect = this.el.querySelector(".product-package");
    const productUnitInput = this.el.querySelector(".product-unit");

    // Retrieve user selections and inputs
    const selectedProductId = productSelect.value || "";
    const selectedProductQty = productQtyInput.value;
    const selectedProductPackage = productPackageSelect.value;
    const selectedProductUnit = productUnitInput.value;

    if(selectedProductId === ""){
        this.notification.add("Please select a product.", { type: 'warning' });
        return;
    }

    // Find the selected product from this.data
    const selectedProduct = this.data.find(
        (product) => product.product_id == selectedProductId
    );
    console.log(selectedProduct)
    if (selectedProduct) {
        const productRowData = {
            product_id: selectedProductId,
            product_pkg: selectedProductPackage,
            product_qty: selectedProductQty,
            product_uom: selectedProductUnit,
          }
          // Generate the row using `_createProductRow`
          const newRow = document.createElement("tr");
          newRow.innerHTML = this._createProductRow(productRowData);
  
          // Append the new row to the table
          tableBody.appendChild(newRow);
  
          // Reset the first row inputs for new product selection
          productSelect.value = ""; // Reset product dropdown
          productQtyInput.value = ""; // Clear quantity input
          productPackageSelect.value = ""; // Reset package dropdown
          productUnitInput.value = ""; // Clear unit input
    }
},
    _saveDataToLocalStorage(){
      // console.log(selectedProduct,'selected product ')
      console.log("save data to local storage .....")
      const tableRows = this.el.querySelectorAll('#productTableBody tr')
      console.log(tableRows,'table rows...')
      const rowData = [];
      tableRows.forEach((row) => {
          const productName = row.querySelector(".product-name").value;
          const quantity = row.querySelector(".product-qty").value;
          const packag = row.querySelector(".product-package").value;
          const unit = row.querySelector(".product-unit").value;

            rowData.push({
                productName,
                quantity,
                packag,
                unit,
            })
        })

        localStorage.setItem("addedProducts", JSON.stringify(rowData));

    },


});

publicWidget.registry.add_more = addMore;

export default addMore;