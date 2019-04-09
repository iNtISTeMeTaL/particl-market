// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItemTemplateCreateRequest } from '../../requests/ListingItemTemplateCreateRequest';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { CryptoAddressType } from 'omp-lib/dist/interfaces/crypto';

export class ListingItemTemplateAddCommand extends BaseCommand implements RpcCommandInterface<ListingItemTemplate> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.TEMPLATE_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profile_id
     *
     *  itemInformation
     *  [1]: title
     *  [2]: short description
     *  [3]: long description
     *  [4]: category id
     *
     *  paymentInformation
     *  [5]: payment type
     *  [6]: currency
     *  [7]: base price
     *  [8]: domestic shipping price
     *  [9]: international shipping price
     *  [10]: payment address (optional)
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ListingItemTemplate> {

        if (data.params.length >= 9) {

            let cryptocurrencyAddress;

            if (data.params[10]) {
                cryptocurrencyAddress = {
                    type: CryptoAddressType.NORMAL,
                    address: data.params[10]
                };
            }

            const body = {
                profile_id: data.params[0],
                itemInformation: {
                    title: data.params[1],
                    shortDescription: data.params[2],
                    longDescription: data.params[3],
                    itemCategory: {
                        id: data.params[4]
                    }
                },
                paymentInformation: {
                    type: data.params[5],
                    itemPrice: {
                        currency: data.params[6],
                        basePrice: data.params[7],
                        shippingPrice: {
                            domestic: data.params[8],
                            international: data.params[9]
                        },
                        cryptocurrencyAddress
                    }
                }
            } as ListingItemTemplateCreateRequest;

            return await this.listingItemTemplateService.create(body);
        } else {
            throw new MessageException('Not enough params.');
        }
    }

    public usage(): string {
        return this.getName() + ' <profileId> <title> <shortDescription> <longDescription> <categoryId>'
            + ' <paymentType> <currency> <basePrice> <domesticShippingPrice> <internationalShippingPrice> [<paymentAddress>] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileId>                   - Numeric - The ID of the profile to associate this \n'
            + '                                     item listing template with. \n'
            + '    <title>                       - String - The default title to associate with \n'
            + '                                     the listing item template we\'re creating. \n'
            + '    <shortDescription>            - String - A short default description for the \n'
            + '                                     listing item template we are creating. \n'
            + '    <longDescription>             - String - A longer default description for the \n'
            + '                                     listing item template we are creating. \n'
            + '    <categoryId>                - Numeric - The identifier id of the default \n'
            + '                                     category we want to use with the item listing \n'
            + '                                     template we\'re creating. \n'
            + '    <paymentType>                 - String - Whether the item listing template is by \n'
            + '                                     default for free items or items for sale. \n'
            + '    <currency>                    - String - The default currency for use with the \n'
            + '                                     item template we\'re creating. \n'
            + '    <basePrice>                   - Numeric - The base price for the item template \n'
            + '                                     we\'re creating. \n'
            + '    <domesticShippingPrice>       - Numeric - The default domestic shipping price to \n'
            + '                                     for the item listing template we\'re creating. \n'
            + '    <internationalShippingPrice>  - Numeric - The default international shipping \n'
            + '                                     price for the item listing template we\'re \n'
            + '                                     creating. \n'
            + '    <paymentAddress>              - [optional]String - The default cryptocurrency address for \n'
            + '                                     recieving funds to associate with the listing \n'
            + '                                     item template we\'re creating. ';
    }

    public description(): string {
        return 'Add a new ListingItemTemplate.';
    }

    public example(): string {
        return 'template ' + this.getName() + ' 1'
        + ' \'The Communist Manifesto\''
        + ' \'Fight capitalism by buying this book!\''
        + ' \'Impress all your hippest comrades by attending your next communist revolutionary Starbucks meeting with the original'
        + ' and best book on destroying your economy!\''
        + ' 16 SALE BITCOIN 0.1848 0.1922 0.1945 396tyYFbHxgJcf3kSrSdugp6g4tctUP3ay ';
    }
}
