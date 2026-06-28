<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicPeriod extends Model
{
    protected $fillable = [
        'school_year',
        'semester',
        'start_date',
        'end_date',
        'is_active',
    ];
}