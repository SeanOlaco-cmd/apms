<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RetentionRate extends Model
{
    protected $fillable = [
        'school_id',
        'program_id',
        'academic_period_id',
        'retention_rate',
        'continuing_students',
        'dropped_students',
        'transferred_students',
        'graduated_students',
        'notes',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function academicPeriod()
    {
        return $this->belongsTo(AcademicPeriod::class);
    }
}