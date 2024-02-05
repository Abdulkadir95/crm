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

namespace Espo\Modules\EblaCategoryTree\Controllers;

use Espo\Core\Exceptions\Conflict;
use Espo\Core\Exceptions\Error;
use Espo\Entities\User;
use Espo\Tools\EntityManager\EntityManager as EntityManagerTool;

use Espo\Core\Api\Request;
use Espo\Core\Exceptions\BadRequest;
use Espo\Core\Exceptions\Forbidden;

class EntityManager extends \Espo\Controllers\EntityManager
{
    /**
     * @throws Forbidden
     */
    public function __construct(
        private EntityManagerTool $entityManagerTool
    ) {
    }

    /**
     * @throws BadRequest
     * @throws Error
     * @throws Conflict
     */
    public function postActionCreateEntity(Request $request): bool
    {
        $data = $request->getParsedBody();

        $data = get_object_vars($data);

        if (empty($data['name']) || empty($data['type'])) {
            throw new BadRequest();
        }

        $name = $data['name'];
        $type = $data['type'];
        if ($type === 'CategoryTree') {
            $name = $name . 'Category';
            $data['labelSingular'] = $data['labelSingular'] . ' Category';
            $data['labelPlural'] = $data['labelPlural'] . ' Categories';

            $name = filter_var($name, \FILTER_SANITIZE_STRING);
            $type = filter_var($type, \FILTER_SANITIZE_STRING);

            if (!is_string($name) || !is_string($type)) {
                throw new BadRequest();
            }

            $params = [];

            if (!empty($data['labelSingular'])) {
                $params['labelSingular'] = $data['labelSingular'];
            }

            if (!empty($data['labelPlural'])) {
                $params['labelPlural'] = $data['labelPlural'];
            }

            if (!empty($data['stream'])) {
                $params['stream'] = $data['stream'];
            }

            if (!empty($data['disabled'])) {
                $params['disabled'] = $data['disabled'];
            }

            if (!empty($data['sortBy'])) {
                $params['sortBy'] = $data['sortBy'];
            }

            if (!empty($data['sortDirection'])) {
                $params['asc'] = $data['sortDirection'] === 'asc';
            }

            if (isset($data['textFilterFields']) && is_array($data['textFilterFields'])) {
                $params['textFilterFields'] = $data['textFilterFields'];
            }

            if (!empty($data['color'])) {
                $params['color'] = $data['color'];
            }

            if (!empty($data['iconClass'])) {
                $params['iconClass'] = $data['iconClass'];
            }

            if (isset($data['fullTextSearch'])) {
                $params['fullTextSearch'] = $data['fullTextSearch'];
            }

            if (isset($data['countDisabled'])) {
                $params['countDisabled'] = $data['countDisabled'];
            }

            if (isset($data['optimisticConcurrencyControl'])) {
                $params['optimisticConcurrencyControl'] = $data['optimisticConcurrencyControl'];
            }

            $params['kanbanViewMode'] = !empty($data['kanbanViewMode']);

            if (!empty($data['kanbanStatusIgnoreList'])) {
                $params['kanbanStatusIgnoreList'] = $data['kanbanStatusIgnoreList'];
            }

            $this->entityManagerTool->create($name, $type, $params);

        } else {
            parent::postActionCreateEntity($request);
        }
        return true;
    }
}
