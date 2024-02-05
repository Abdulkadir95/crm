<?php

include "../../bootstrap.php";

use Espo\Modules\EblaForm\Core\{
    EblaFormApplication,
    EblaFormClient,
};

$app = new EblaFormApplication();

$app->run(EblaFormClient::class);
