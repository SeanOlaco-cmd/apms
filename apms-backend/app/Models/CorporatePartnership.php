<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CorporatePartnership extends Model
{
    protected $fillable = [
        'school_id',
        'company_name',
        'industry',
        'partnership_type',
        'start_date',
        'end_date',
        'status',
        'description',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}