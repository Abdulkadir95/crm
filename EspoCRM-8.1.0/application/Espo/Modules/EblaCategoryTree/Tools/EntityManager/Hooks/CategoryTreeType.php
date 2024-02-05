<?php
/************************************************************************
 * This file is part of  the extension: EblaCategoryTree
 * Copyright (c) Eblasoft Bilişim Ltd.
 *
 * This Software is the property of Eblasoft Bilişim Ltd. and is protected
 * by copyright law - it is NOT Freeware and can be used only in one project
 * under a proprietary license, which is delivered along with this program.
 * If not, see <http://eblasoft.com.tr/eula>.
 *
 * This Software is distributed as is, with LIMITED WARRANTY AND LIABILITY.
 * Any unauthorised use of this Software without a valid license is
 * a violation of the License Agreement.
 *
 * According to the terms of the license you shall not resell, sublicense,
 * rent, lease, distribute or otherwise transfer rights or usage of this
 * Software or its derivatives. You may modify the code of this Software
 * for your own needs, if source code is provided.
 ***********************************************************************/

namespace Espo\Modules\EblaCategoryTree\Tools\EntityManager\Hooks;

use Espo\Core\Exceptions\Forbidden;
use Espo\Entities\User;
use Espo\Tools\EntityManager\Hooks\BasePlusType;
use Espo\Tools\EntityManager\EntityManager as EntityManagerTool;


class CategoryTreeType extends BasePlusType
{
    public function __construct(
        private EntityManagerTool $entityManagerTool
    ) {

    }

    public function afterCreate(string $name, array $params): void
    {
        $relationName = str_replace('Category', '', $name);
        $relationName = lcfirst($relationName);
        $data = [
            'fields' => [
                $relationName . 's' => [
                    'type' => 'linkMultiple',
                    'layoutDetailDisabled' => true,
                    'layoutMassUpdateDisabled' => true,
                    'layoutListDisabled' => true,
                    'noLoad' => true,
                    'importDisabled' => true,
                    'exportDisabled' => true,
                    'customizationDisabled' => true,
                ]
            ],
            'links' => [
                $relationName . 's' => [
                    'type' => 'hasMany',
                    'relationName' => lcfirst($relationName) . 'Category' . ucfirst($relationName),
                    'foreign' => $relationName . 'Categories',
                    'entity' => ucfirst($relationName),
                    'audited' => true,
                ]
            ]
        ];
        $this->metadata->set('entityDefs', $name, $data);
        $this->metadata->save();

        $type = 'Base';
        $nameBase = ucfirst($relationName);
        $params['labelSingular'] = ucfirst($nameBase);
        $params['labelPlural'] = ucfirst($nameBase) . 's';

        $this->entityManagerTool->create($nameBase, $type, $params);


        $data = [
            'fields' => [
                $relationName . 'Categories' => [
                    'type' => 'linkMultiple',
                    'layoutDetailDisabled' => true,
                    'layoutMassUpdateDisabled' => true,
                    'layoutListDisabled' => true,
                    'noLoad' => true,
                    'importDisabled' => true,
                    'exportDisabled' => true,
                    'customizationDisabled' => true,
                ]
            ],
            'links' => [
                $relationName . 'Categories' => [
                    'type' => 'hasMany',
                    'relationName' => lcfirst($relationName) . 'Category' . ucfirst($relationName),
                    'foreign' => $relationName . 's',
                    'entity' => ucfirst($relationName) . 'Category',
                    'audited' => true,
                ]
            ]
        ];

        $dataClient = [
            'views' => [
                'list' => 'ebla-category-tree:views/category-base/list'
            ]
        ];

        $this->metadata->set('entityDefs', $nameBase, $data);
        $this->metadata->set('clientDefs', $nameBase, $dataClient);
        $this->metadata->save();
    }
}
