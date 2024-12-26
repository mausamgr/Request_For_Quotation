/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import VariantMixin from "@website_sale/js/sale_variant_mixin";
import { rpc } from "@web/core/network/rpc";

const addMore = publicWidget.Widget.extend(VariantMixin, {
  selector: "#sm_new_request_form",

  events: {
    "click #addMore": "_onClickAddMore", // Event binding for Add More button
    "change #productSelect": "_onProductChange",
    "input #productSelect": "_onProductSearch",
    "click #submit": "_onClickSubmit",
    "click #save": "_onClickSave",
    "click #retrieve": "_retrieveDataFromSession",
    "click #addProduct": "_onClickAddProduct"
  },
  data: [],
  init() {
    this._super(...arguments);
    // this.rpc = this.bindService("rpc");
    this.data = [];
  },

  async start() {
    await this._super.apply(this, arguments);
    this._renderContent();
  },

  async _renderContent() {
    // console.log("render content .......")
    // console.log(await rpc("/api/products"));
    try {
      const res = await rpc("/api/products");
      this.data = res.data;
      // console.log(data,'data......')
    } catch (error) {
      console.log("Error rendering content", error);
    }
  },
  
  async _onClickSave(ev) {
    ev.preventDefault();
    console.log("Save button clicked");

    const formData = {
        partner_id: this.el.querySelector("#partner_id").value,
        request_date: this.el.querySelector("#request_date").value,
        data_order: this.el.querySelector("#data_order").value,
        date_planned: this.el.querySelector("#date_planned").value,
        products: [],
    };

    // Get table rows, excluding any empty rows without product fields
    const tableRows = Array.from(this.el.querySelectorAll("#productTableBody tr"))
        .filter((row) => row.querySelector(".product"));
    console.log(tableRows)
    // If there are no rows, save empty products array
    if (tableRows.length === 0) {
        console.log("No products in table. Saving empty data.");
        // You can also push an empty object if needed
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
    }

    try {
        const response = await rpc("/api/save_rfq_data", {
            method: "POST",
            body: JSON.stringify(formData),
            headers: { "Content-Type": "application/json" },
        });
        console.log(response);
        if (response.success) {
            alert("Data saved successfully!");
        } else {
            alert("Failed to save data. Please try again.");
        }
    } catch (error) {
        console.error("Error submitting RFQ", error);
        alert("An error occurred while submitting the request.", error);
    }
},

async _retrieveDataFromSession() {
  try {
      const response = await rpc("/api/get_rfq_data", { method: "GET" });

      if (response.success && response.data) {
          const data = response.data;
          console.log("Data retrieved:\t", data);

          // Populate the form fields
          this.el.querySelector("#partner_id").value = data.partner_id || "";
          this.el.querySelector("#request_date").value = data.request_date || "";
          this.el.querySelector("#data_order").value = data.data_order || "";
          this.el.querySelector("#date_planned").value = data.date_planned || "";

          const tableBody = this.el.querySelector("#productTableBody");
          tableBody.innerHTML = ""; // Clear existing rows

          const products = (data.products || []).filter(
              (product) =>
                  product.product_id || product.product_qty || product.product_pkg || product.product_uom
          );
          if (products.length === 0) {
              // Show a message when no valid products exist
              const emptyMessage = document.createElement("tr");
              emptyMessage.innerHTML = `
                  <td colspan="5" class="text-center">
                      No products found in the RFQ. Please add products to proceed.
                      <button type="button" id="addProduct" class="btn btn-primary mt-2">Add Product</button>
                  </td>
              `;
              tableBody.appendChild(emptyMessage);
              return;
          }

          // Populate the valid product rows
          products.forEach((product) => {
              const newRow = document.createElement("tr");
              newRow.innerHTML = `
                  <td>
                      <input type="hidden" name="product_id" class="product" 
                          value="${product.product_id}" readonly />
                      <input type="text" name="product_name" class="product-name" 
                          value="${product.product_name || ''}" readonly />
                  </td>
                  <td>
                      <input type="number" name="product_qty" class="product-qty" 
                          value="${product.product_qty}" readonly />
                  </td>
                  <td>
                      <input type="text" name="product_package" class="product-package" 
                          value="${product.product_pkg}" readonly />
                  </td>
                  <td>
                      <input type="text" name="product_unit" class="product-unit" 
                          value="${product.product_uom}" readonly />
                  </td>
                  <td>
                      <button type="button" id="addMore" class="btn btn-primary">Add More</button>
                      <button type="button" class="btn btn-danger btn-remove">Remove</button>
                  </td>
              `;
              tableBody.appendChild(newRow);

              // Add event listener for the Remove button
              newRow.querySelector(".btn-remove").addEventListener("click", async () => {
                  try {
                      newRow.remove(); // Remove the row from the frontend
                      const removeResponse = await rpc("/api/remove_rfq_data", {
                          method: "POST",
                          body: JSON.stringify({
                              product_id: product.product_id,
                              product_qty: product.product_qty,
                          }),
                          headers: { "Content-Type": "application/json" },
                      });

                      if (removeResponse.success) {
                          console.log(`Product ID ${product.product_id} removed from session.`);
                          if (tableBody.children.length === 0) {
                              this.el.querySelector("#data_order").value = "";
                              this.el.querySelector("#date_planned").value = "";

                              const emptyMessage = document.createElement("tr");
                              emptyMessage.innerHTML = `
                                  <td colspan="5" class="text-center">
                                      No products in the RFQ. Please add products to proceed.
                                  </td>
                              `;
                              tableBody.appendChild(emptyMessage);
                          }
                      } else {
                          alert("Failed to remove the data from the session.");
                      }
                  } catch (error) {
                      console.error(`Error removing product ID ${product.product_id} from session`, error);
                      alert("An error occurred while removing the data.");
                  }
              });
          });

          alert("Data retrieved successfully!");
      } else {
          alert("No saved data found.");
      }
  } catch (error) {
      console.error("Error retrieving data from session", error);
      alert("An error occurred while retrieving the data.");
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
      // Find the parent row of the select
      const row = select.closest("tr");

      // Update package and unit fields
      const packageInput = row.querySelector(".product-package");
      const unitInput = row.querySelector(".product-unit");
      // Assuming selectedProduct.package is a list of options
      const packageOptions = selectedProduct.package || [];

      // Clear existing options (if any)
      packageInput.innerHTML = '<option value="" disabled selected>Select a package</option>';

      // Populate dropdown
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
    let hasError = false; // Flag to track validation errors
    const tableRows = this.el.querySelectorAll("#productTableBody tr");
    tableRows.forEach((row) => {
      console.log("row = \t",row)
      const productName = row.querySelector(".product").value;
      console.log("product name:\t",productName)
      const productQty = row.querySelector(".product-qty").value;
      const productPackage = row.querySelector(".product-package").value;
      const productUnit = row.querySelector(".product-unit").value;

      if (productName === ""){
        hasError = true
        return
      }
      else{
        hasError = false
      }

      formData.products.push({
        product_id: productName,
        product_qty: productQty,
        product_pkg: productPackage,
        product_uom: productUnit,
      });
    });
    if (hasError){
      alert("Please select a product")
      return
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
        alert("Request for Quotation submitted successfully!");
        location.reload(); // Optionally, refresh the page
      } else {
        alert("Failed to submit the request. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting RFQ", error);
      alert("An error occurred while submitting the request.", error);
    }
  },

  async _onClickAddProduct(ev){
    ev.preventDefault();
    const products = this.data;
    const tableBody = this.el.querySelector("#productTableBody");
    tableBody.innerHTML = ""; // Clear existing rows
    // Create the product form HTML with a dynamic select dropdown
    const productSelectOptions = products.map(product => {
      return `<option value="${product.product_id}">${product.product_name}</option>`;
  }).join('');
    const productFormHTML = `
                  <tr>
                      <td style="vertical-align: middle;">
                          <select id="productSelect" name="product" class="product" style="width: 120px; padding: 5px; font-size: 14px;">
                              <option value="" selected="selected">Select a product</option>
                              ${productSelectOptions}
                          </select>
                      </td>
                      <td style="vertical-align: middle;">
                          <input type="number" name="product-qty[]" class="product-qty" 
                              placeholder="Enter a product quantity" 
                              style="width: 80px; padding: 5px; font-size: 14px; text-align: center;"/>
                      </td>
                      <td style="vertical-align: middle;">
                          <select name="product-package" class="product-package" 
                              style="width: 120px; padding: 5px; font-size: 14px;">
                              <option value="" selected="selected">Select a package</option>
                          </select>
                      </td>
                      <td style="vertical-align: middle;">
                          <input type="text" name="product-unit" class="product-unit" readonly="readonly" 
                              placeholder="Select a product first" 
                              style="width: 120px; padding: 5px; font-size: 14px; background-color: #f9f9f9; text-align: center;"/>
                      </td>
                      <td style="vertical-align: middle;">
                          <div class="btn-addmore" style="text-align: center;">
                              <button type="button" id="addMore" class="btn btn-primary" 
                                  style="font-size: 16px; padding: 8px 16px; width: 150px;">
                                  Add More
                              </button>
                          </div>
                      </td>
                  </tr>
              `;
     // Insert the product form row into the table
     tableBody.insertAdjacentHTML("beforeend", productFormHTML);
  },

  _onClickAddMore(ev) {
    ev.preventDefault();

    const productSelect = this.el.querySelector("#productSelect");
    const tableBody = this.el.querySelector("#productTableBody");
    const productQtyInput = this.el.querySelector(".product-qty");
    const productPackageSelect = this.el.querySelector(".product-package");
    const productUnitInput = this.el.querySelector(".product-unit");

    // Retrieve user selections and inputs
    const selectedProductId = productSelect.value;
    const selectedProductQty = productQtyInput.value;
    const selectedProductPackage = productPackageSelect.value;
    const selectedProductUnit = productUnitInput.value;

    if(selectedProductId === ""){
      alert("Please select a product")
      return
    }

    // Find the selected product from this.data
    const selectedProduct = this.data.find(
        (product) => product.product_id == selectedProductId
    );
    console.log(selectedProduct)
    if (selectedProduct) {
        // Append a new readonly row with the selected product details
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>
                <input type="hidden" name="product_id" class="product" 
                    value="${selectedProduct.product_id}" readonly />
                <input type="text" name="product_name" class="product-name" 
                    value="${selectedProduct.product_name}" readonly />
            </td>
            <td>
                <input type="number" name="product_qty" class="product-qty" 
                    value="${selectedProductQty}" readonly />
            </td>
            <td>
                <input type="text" name="product_package" class="product-package" 
                    value="${selectedProductPackage}" readonly />
            </td>
            <td>
                <input type="text" name="product_unit" class="product-unit" 
                    value="${selectedProductUnit}" readonly />
            </td>
            <td>
                <button type="button" class="btn btn-danger btn-remove">Remove</button>
            </td>
        `;
        tableBody.appendChild(newRow);

        // Add event listener for the Remove button
        newRow.querySelector(".btn-remove").addEventListener("click", function () {
            newRow.remove();
        });

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
              // selectedProduct
          })
      })

      localStorage.setItem("addedProducts",JSON.stringify(rowData));

    },


});

publicWidget.registry.add_more = addMore;

export default addMore;
