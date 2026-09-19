<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_year',
        'semester',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
