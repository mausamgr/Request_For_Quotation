import json

from odoo import http
from odoo.http import Response, request


class ProductAPIController(http.Controller):
    
    @http.route('/api/products', type='json',website=True, auth='public')
    def get_products(self):
        try:
            products = request.env['product.template'].search([])
            result = []

            for product in products:
                variants = [
                    {
                        'variant_id': variant.id,
                        'variant_name': variant.display_name,
                        'price': variant.list_price,
                        # 'unit': product.uom_id.name,
                    } for variant in product.product_variant_ids
                ]
                packages = [package.name for package in product.packaging_ids]
                result.append({
                    'product_id': product.id,
                    'product_name': product.name,
                    'price': product.list_price,
                    'category': product.categ_id.name,
                    'unit': product.uom_id.sudo().name,
                    'package': packages,
                    'variants': variants,
                })

            return{
                "status":200,
                "data":result
            } 
            # return Response(
            #     json.dumps({'status': 'success', 'data': result}),
            #     content_type='application/json',
            #     status=200
            # )
        # except Exception as e:
        #     return Response(
        #         json.dumps({'status': 'error', 'message': str(e)}),
        #         content_type='application/json',
        #         status=500
        #     )
        except Exception as e:
            return{
                "status":500,
                "error":str(e)
            }
