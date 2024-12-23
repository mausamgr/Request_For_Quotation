import json
from datetime import datetime

from odoo import http
from odoo.http import request


class RFQController(http.Controller):

    def format_datetime(self, datetime_str:any):
        # Convert to datetime object
        datetime_obj = datetime.strptime(datetime_str, "%Y-%m-%dT%H:%M")

        # Format to the desired format
        formatted_datetime = datetime_obj.strftime("%Y-%m-%d %H:%M")
        return formatted_datetime

    @http.route('/api/create_rfq', type='json', auth='public', methods=['POST'], csrf=False)
    def create_rfq(self, **kwargs):
        try:
            kwargs = json.loads(kwargs.get('body'))
            partner_id = kwargs.get('partner_id')
            date_order = self.format_datetime(kwargs.get('data_order'))
            date_planned = self.format_datetime(kwargs.get('date_planned'))
            products = kwargs.get('products')


            if not date_order:
                return {'error': 'Order date is required.'}
            if not date_planned:
                return {'error': 'Planned date is required.'}
            if not products:
                return {'error': 'Products are required.'}
            partner = (
                request.env['res.partner'].sudo().search([('id', '=', partner_id)] if isinstance(partner_id, int) else [('name', '=', partner_id)], limit=1)
            )
            if not partner:
                return {'error': 'Partner not found.'}


            order_lines = []
            for product_data in products:
                product_id = product_data.get('product_id')
                product_qty = product_data.get('product_qty')
                product_uom = product_data.get('product_uom')
                product_pkg = product_data.get('product_pkg')


                product = (
                    request.env['product.product'].sudo().search([('product_tmpl_id', '=', int(product_id))], limit=1)
                )
                if not product:
                    return {'error': f"product not found: {product_id}"}

                uom = request.env['uom.uom'].sudo().search([('id', '=', product_uom)] if isinstance(product_uom, int) else [('name', '=', product_uom)], limit=1)
                if not uom:
                    return {'error': f"unit of measure not found"}
                if product_pkg:
                    pkg = request.env['product.packaging'].sudo().search([('name','=', product_pkg)],limit=1)
                    if not pkg:
                        return {'error': f"package of product not found: {product_pkg}"}
                order_lines.append((0, 0, {
                    'product_id': product.id,
                    'product_qty': product_qty,
                    'product_uom': uom.id,
                    'date_planned': date_planned,
                    'price_unit': product.standard_price,
                    'product_packaging_id': pkg.id if product_pkg else None,
                    'product_packaging_qty': pkg.qty if product_pkg else None,
                }))


            purchase_order = request.env['purchase.order'].sudo().create({
                'partner_id': partner.id,
                'date_order': date_order,
                'order_line': order_lines,
            })

            return {'success': True, 'rfq_id': purchase_order.id}

        except Exception as e:
            return {'error': str(e)}
