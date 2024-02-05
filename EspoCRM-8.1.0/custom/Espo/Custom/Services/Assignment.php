<?php

namespace Espo\Custom\Services;

use Espo\Core\Templates\Services\BasePlus;
use Espo\ORM\Entity;

class Assignment extends BasePlus
{
    protected $itemEntityType = 'AssignmentItem';

    protected $itemParentIdAttribute = 'assignmentId';

    public function loadAdditionalFields(Entity $entity)
    {
        parent::loadAdditionalFields($entity);

        $itemList = $this->entityManager->getRepository($this->itemEntityType)->where([
            $this->itemParentIdAttribute => $entity->id
        ])->order('order')->find();

        $itemDataList = $itemList->getValueMapList();
        foreach ($itemDataList as $i => $v) {
            $itemDataList[$i] = (object)$v;
        }
        $entity->set('itemList', $itemDataList);
    }

    public function getCopiedEntityAttributeItemList(Entity $entity)
    {
        $itemEntityType = $this->entityType . 'Item';
        $link = lcfirst($this->entityType);
        $idAttribute = $link . 'Id';
        $nameAttribute = $link . 'Name';

        $itemList = $this->entityManager->getRepository($itemEntityType)->where([
            $idAttribute => $entity->id
        ])->order('order')->find();

        $copiedItemList = [];
        foreach ($itemList as $item) {
            $arr = $item->toArray();
            $copiedItem = (object)$arr;
            $copiedItem->$idAttribute = null;
            $copiedItem->$nameAttribute = null;
            $copiedItemList[] = $copiedItem;
        }
        return $copiedItemList;
    }

    public function getConvertCurrencyValues(Entity $entity, string $targetCurrency, string $baseCurrency, $rates, bool $allFields = false, ?array $fieldList = null)
    {
        $data = parent::getConvertCurrencyValues($entity, $targetCurrency, $baseCurrency, $rates, $allFields, $fieldList);

        $forbiddenFieldList = $this->getAcl()->getScopeForbiddenFieldList($this->entityType, 'edit');

        if (
            $allFields && !in_array('itemList', $forbiddenFieldList) &&
            (!$fieldList || in_array('amount', $fieldList))

        ) {
            $itemList = [];

            $itemService = $this->serviceFactory->create($this->itemEntityType);

            $itemFieldList = [];
            foreach ($this->fieldManagerUtil->getEntityTypeFieldList($this->itemEntityType) as $field) {
                if ($this->metadata->get(['entityDefs', $this->itemEntityType, 'fields', $field, 'type']) !== 'currency') continue;
                $itemFieldList[] = $field;
            }

            $itemCollection = $this->entityManager->getRepository($this->itemEntityType)->where([
                $this->itemParentIdAttribute => $entity->id
            ])->order('order')->find();

            foreach ($itemCollection as $item) {
                $values = $itemService->getConvertCurrencyValues($item, $targetCurrency, $baseCurrency, $rates, true, $itemFieldList);

                $item->set($values);
                $o = $item->getValueMap();
                $itemList[] = $o;
            }

            $data->itemList = $itemList;
        }

        return $data;
    }
}
